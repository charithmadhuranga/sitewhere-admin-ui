<template>
  <content-tab :tabkey="tabkey" :loaded="loaded" loadingMessage="Loading...">
    <template slot="header">
      <v-container class="pa-0">
        <v-row no-gutters>
          <v-col cols="3">
            <condensed-toolbar title="Scripts">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon @click="onScriptCreate" small class="mr-2" v-on="on">add</v-icon>
                </template>
                <span>Create Script</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon @click="refresh" small v-on="on">refresh</v-icon>
                </template>
                <span>Refresh Scripts</span>
              </v-tooltip>
            </condensed-toolbar>
          </v-col>
          <v-col cols="9">
            <div v-if="this.selectedScript != null" style="border-left: 1px solid #999;">
              <condensed-toolbar :title="scriptTitle">
                <template slot="icon">
                  <v-icon style="font-size: 10px;">fa-code</v-icon>
                </template>
                <v-menu v-if="selectedScript" offset-y left class="mr-3" max-width="400">
                  <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark v-on="on">
                      <v-icon small class="mr-1" :color="versionColor">
                        {{
                        versionIcon
                        }}
                      </v-icon>
                      <span v-if="selectedVersion" class="caption white--text">
                        {{
                        formatDate(selectedVersion.createdDate)
                        }}
                      </span>
                      <v-icon small>expand_more</v-icon>
                    </v-btn>
                  </template>
                  <script-version-list
                    :versions="versions"
                    :selectedScript="selectedScript"
                    @selected="onVersionSelected"
                  />
                </v-menu>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon @click="onActivate" small class="mr-2" v-on="on">play_circle_outline</v-icon>
                  </template>
                  <span>Make Version Active</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon @click="onClone" small class="mr-2" v-on="on">note_add</v-icon>
                  </template>
                  <span>Clone as New Version</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon @click="onSave" small class="mr-2" v-on="on">cloud_upload</v-icon>
                  </template>
                  <span>Upload Changes</span>
                </v-tooltip>
              </condensed-toolbar>
            </div>
            <v-card flat v-else height="100%">
              <v-divider />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <v-container fill-height style="align-items: stretch;" class="pa-0">
      <v-row align="stretch" justify="start" no-gutters style="border-bottom: 1px solid #eee;">
        <v-col cols="3">
          <v-expansion-panels tile v-if="scriptsByCategory && scriptsByCategory.length">
            <v-expansion-panel
              v-for="category in scriptsByCategory"
              :key="category.id"
              :expand="true"
              :value="0"
            >
              <v-expansion-panel-header>{{ category.name }}</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-list
                  class="pa-0"
                  dark
                  color="primary"
                  v-if="category.scripts && category.scripts.length"
                  dense
                >
                  <v-list-item
                    v-for="script in category.scripts"
                    :key="script.id"
                    @click="onScriptClicked(script)"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-icon style="font-size: 12px;" color="grey" class="mr-2">fa-code</v-icon>
                        {{ script.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-card flat v-else>
                  <v-card-text style="text-align: center;">No Scripts Configured</v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-card flat tile v-else class="subheading">
            <v-card-text>No scripts have been configured.</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="9">
          <scripts-content-editor
            v-if="this.selectedScript != null"
            ref="content"
            :script="selectedScript"
            :version="selectedVersion"
            :identifier="identifier"
            :tenantToken="tenantToken"
            @content="onContentUpdated"
            @save="onSave"
          />
          <v-card tile flat v-else height="100%">
            <v-divider vertical />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <template slot="dialogs">
      <script-create-dialog
        ref="create"
        :identifier="identifier"
        :tenantToken="tenantToken"
        :scriptCategories="scriptCategories"
        @scriptAdded="onScriptAdded"
      />
      <script-create-clone-dialog
        ref="clone"
        :identifier="identifier"
        :tenantToken="tenantToken"
        @save="onSaveClone"
      />
    </template>
  </content-tab>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Ref } from "vue-property-decorator";
import {
  listTenantScriptsByCategory,
  getTenantScriptMetadata,
  updateTenantScript,
  cloneTenantScript,
  activateTenantScript,
} from "sitewhere-ide-common";

import { ContentTab } from "sitewhere-ide-components";
import CondensedToolbar from "../common/CondensedToolbar.vue";
import ScriptVersionList from "./ScriptVersionList.vue";
import ScriptsContentEditor from "./ScriptsContentEditor.vue";
import ScriptCreateDialog from "./ScriptCreateDialog.vue";
import ScriptCreateCloneDialog from "./ScriptCreateCloneDialog.vue";

import { AxiosResponse } from "axios";
import { formatDate, showMessage, showError } from "sitewhere-ide-common";
import {
  IScriptCategory,
  IScriptMetadata,
  IScriptVersion,
} from "sitewhere-rest-api";

@Component({
  components: {
    ContentTab,
    CondensedToolbar,
    ScriptVersionList,
    ScriptsContentEditor,
    ScriptCreateDialog,
    ScriptCreateCloneDialog,
  },
})
export default class ScriptsManager extends Vue {
  @Prop() readonly tabkey!: string;
  @Prop() readonly identifier!: string;
  @Prop() readonly tenantToken!: string;
  @Prop() readonly scriptCategories!: IScriptCategory[];
  @Ref() readonly create!: ScriptCreateDialog;
  @Ref() readonly contentEditor!: ScriptsContentEditor;
  @Ref() readonly clone!: ScriptCreateCloneDialog;

  scriptsByCategory: IScriptCategory[] = [];
  selectedScript: IScriptMetadata | null = null;
  scriptAfterRefresh: string | null = null;
  versions: IScriptVersion[] = [];
  selectedVersion: IScriptVersion | null = null;
  versionAfterRefresh: string | null = null;
  content = "";
  loaded = false;

  created() {
    this.loaded = false;
    this.refresh();
    this.loaded = true;
  }

  /** Refresh list of scripts */
  async refresh() {
    try {
      const response: AxiosResponse<
        IScriptCategory[]
      > = await listTenantScriptsByCategory(
        this.$store,
        this.identifier,
        this.tenantToken
      );
      this.onScriptsRefreshed(response.data);
    } catch (err) {
      showError(this, err);
    }
  }

  /** Load selected script after refresh */
  onScriptsRefreshed(scriptsByCategory: IScriptCategory[]) {
    this.scriptsByCategory = scriptsByCategory;
    if (this.scriptAfterRefresh) {
      this.scriptsByCategory.forEach((category) => {
        if (category.scripts) {
          category.scripts.forEach((script) => {
            if (this.scriptAfterRefresh === script.id) {
              this.onScriptClicked(script);
            }
          });
        }
      });
      this.scriptAfterRefresh = null;
    }
  }

  /** Called when script create button is pressed */
  onScriptCreate() {
    this.create.open();
  }

  /** Indicates that a new script was added */
  onScriptAdded(scriptId: string) {
    this.scriptAfterRefresh = scriptId;
    this.refresh();
  }

  /** Called when a script is clicked */
  async onScriptClicked(script: IScriptMetadata) {
    try {
      const response: AxiosResponse<IScriptMetadata> = await getTenantScriptMetadata(
        this.$store,
        this.identifier,
        this.tenantToken,
        script.id
      );
      this.onScriptLoaded(response.data);
    } catch (err) {
      showError(this, err);
    }
  }

  /** Called after script detail has been loaded */
  onScriptLoaded(script: IScriptMetadata): void {
    this.selectedScript = script;
    this.versions = script.versions;
    const versionId = this.versionAfterRefresh;
    if (versionId) {
      for (let i = 0; i < script.versions.length; i++) {
        if (versionId === script.versions[i].versionId) {
          this.selectedVersion = script.versions[i];
          this.versionAfterRefresh = null;
        }
      }
    } else {
      if (script.versions.length > 0) {
        this.selectedVersion = script.versions[0];
      }
    }
  }

  /** Called when a version is clicked */
  onVersionSelected(version: IScriptVersion) {
    this.selectedVersion = version;
  }

  /** Called when content is updated */
  onContentUpdated(content: string) {
    this.content = content;
  }

  /** Save editor content */
  async onSave() {
    if (this.selectedScript && this.selectedVersion) {
      const updated = {
        id: this.selectedScript.id,
        name: this.selectedScript.name,
        category: "",
        description: "",
        interpreterType: this.selectedScript.interpreterType,
        content: btoa(this.content),
      };
      try {
        await updateTenantScript(
          this.$store,
          this.identifier,
          this.tenantToken,
          this.selectedScript.id,
          this.selectedVersion.versionId,
          updated
        );
        this.onContentSaved();
      } catch (err) {
        showError(this, err);
      }
    }
  }

  /** Called when content is saved successfully */
  onContentSaved() {
    showMessage(this, "Script Content Saved Successfully.");
  }

  /** Show dialog for creating clone */
  onClone() {
    this.clone.open();
  }

  /** Create clone of edited version */
  async onSaveClone(version: IScriptVersion) {
    const request = {
      comment: version.comment,
    };
    if (this.selectedScript && this.selectedVersion) {
      try {
        const response: AxiosResponse<IScriptVersion> = await cloneTenantScript(
          this.$store,
          this.identifier,
          this.tenantToken,
          this.selectedScript.id,
          this.selectedVersion.versionId,
          request
        );
        this.onVersionCloned(response.data);
      } catch (err) {
        showError(this, err);
      }
    }
  }

  /** Called after a script version has been cloned */
  onVersionCloned(version: IScriptVersion) {
    if (this.selectedScript) {
      this.scriptAfterRefresh = this.selectedScript.id;
      this.versionAfterRefresh = version.versionId;
      this.refresh();
      showMessage(this, "Version Cloned Successfully.");
    }
  }

  /** Activate current version */
  async onActivate() {
    if (this.selectedScript && this.selectedVersion) {
      await activateTenantScript(
        this.$store,
        this.identifier,
        this.tenantToken,
        this.selectedScript.id,
        this.selectedVersion.versionId
      );
      this.onVersionActivated();
    }
  }

  /** Called after version has been activated */
  onVersionActivated() {
    if (this.selectedScript && this.selectedVersion) {
      this.scriptAfterRefresh = this.selectedScript.id;
      this.versionAfterRefresh = this.selectedVersion.versionId;
      this.refresh();
      showMessage(this, "Version Activated Successfully.");
    }
  }

  /** Build script title */
  get scriptTitle() {
    if (this.selectedScript && this.selectedVersion) {
      return (
        this.selectedScript.name +
        " (" +
        this.selectedScript.id +
        "." +
        this.selectedScript.interpreterType +
        ")"
      );
    }
    return null;
  }

  /** Function to determine if a version is active for a script */
  isVersionActive(
    selected: IScriptMetadata | null,
    version: IScriptVersion | null
  ): boolean {
    if (selected && version) {
      if (selected.activeVersion === version.versionId) {
        return true;
      }
    }
    return false;
  }

  /** Get icon indicating whether current version is active */
  get versionIcon(): string {
    return this.isVersionActive(this.selectedScript, this.selectedVersion)
      ? "check_circle"
      : "power_settings_new";
  }

  /** Get icon indicating whether current version is active */
  get versionColor(): string {
    return this.isVersionActive(this.selectedScript, this.selectedVersion)
      ? "#8fcb8f"
      : "#ccc";
  }

  /** Make function available to template */
  formatDate(date: Date) {
    return formatDate(date);
  }
}
</script>
