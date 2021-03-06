<template>
  <v-container style="align-items: stretch;" class="pa-0" fill-height>
    <v-row no-gutters v-if="selectedVersion">
      <v-col cols="12">
        <v-card flat tile height="100%">
          <editor
            ref="editor"
            v-model="content"
            @init="editorInit"
            lang="groovy"
            theme="chrome"
            :options="aceOptions"
            width="100%"
            height="100%"
          ></editor>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch, Ref } from "vue-property-decorator";
import { getTenantScriptContent } from "sitewhere-ide-common";

import { AxiosResponse } from "axios";
import { formatDate } from "sitewhere-ide-common";
import { IScriptMetadata, IScriptVersion } from "sitewhere-rest-api";

@Component({
  components: {
    editor: require("vue2-ace-editor"),
  },
})
export default class ScriptsContentEditor extends Vue {
  @Prop() readonly identifier!: string;
  @Prop() readonly tenantToken!: string;
  @Prop() readonly script!: IScriptMetadata;
  @Prop() readonly version!: IScriptVersion;
  @Ref() readonly editorReference!: any;

  selectedScript: any = null;
  selectedVersion: any = null;
  content = "";
  aceOptions: {} = {
    showPrintMargin: false,
  };

  @Watch("script", { immediate: true })
  onScriptUpdated(updated: IScriptMetadata) {
    this.selectedScript = updated;
  }

  @Watch("version", { immediate: true })
  onVersionUpdated(updated: IScriptVersion) {
    this.selectedVersion = updated;
  }

  @Watch("selectedVersion", { immediate: true })
  onSelectedVersionUpdated() {
    this.updateContent();
  }

  @Watch("content", { immediate: true })
  onContentUpdated(updated: string) {
    this.$emit("content", updated);
  }

  /** Get handle to embedded Ace editor */
  get editor(): any {
    return this.editorReference ? this.editorReference.editor : null;
  }

  /** Initialize code editor by requiring dependencies */
  editorInit() {
    require("brace/ext/language_tools"); //language extension prerequsite...
    require("brace/mode/groovy");
    require("brace/mode/javascript"); //language
    require("brace/mode/less");
    require("brace/theme/chrome");
    require("brace/snippets/javascript"); //snippet

    if (this.editor) {
      this.editor.commands.addCommand({
        name: "save",
        bindKey: { win: "Ctrl-S", mac: "Cmd-S" },
        exec: this.onSaveContent,
      });
    }
  }

  /** Update script content */
  async updateContent() {
    const response: AxiosResponse<string> = await getTenantScriptContent(
      this.$store,
      this.identifier,
      this.tenantToken,
      this.selectedScript.id,
      this.selectedVersion.versionId
    );
    this.content = response.data;
    console.log(this.editor);
  }

  /** Called when save keybinding is clicked */
  onSaveContent() {
    this.$emit("save");
  }

  /** Make function available to template */
  formatDate(date: Date) {
    return formatDate(date);
  }
}
</script>
