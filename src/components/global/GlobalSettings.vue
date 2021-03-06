<template>
  <detail-page
    :icon="icon"
    :tabsOnBottom="true"
    title="Instance Settings"
    loadingMessage="Loading instance configuration ..."
    :loaded="loaded"
    :record="configuration"
  >
    <template slot="header">
      <unsaved-updates-panel
        v-if="dirty"
        @revert="onRevertConfiguration"
        @save="onSaveConfiguration"
      />
    </template>
    <template slot="tabs">
      <v-tab key="persistence">Persistence</v-tab>
      <v-tab key="infra">Infrastructure</v-tab>
      <v-tab key="json">JSON</v-tab>
    </template>
    <template slot="tab-items">
      <persistence-configurations-editor
        tabkey="persistence"
        :configuration="workingCopy"
        @updated="onPersistenceConfigurationsUpdated"
      />
      <infrastructure-editor
        tabkey="infra"
        :configuration="workingCopy"
        @updated="onInfrastructureUpdated"
      />
      <instance-configuration-source tabkey="json" :configuration="workingCopy" />
    </template>
    <template slot="actions" />
  </detail-page>
</template>

<script lang="ts">
import Vue from "vue";

import { AxiosResponse } from "axios";
import { Component, Watch } from "vue-property-decorator";
import {
  NavigationIcon,
  getInstanceConfiguration,
  updateInstanceConfiguration
} from "sitewhere-ide-common";
import { DetailPage } from "sitewhere-ide-components";

import InfrastructureEditor from "./configuration/infrastructure/InfrastructureEditor.vue";
import PersistenceConfigurationsEditor from "./configuration/persistence/PersistenceConfigurationsEditor.vue";
import InstanceConfigurationSource from "./InstanceConfigurationSource.vue";
import UnsavedUpdatesPanel from "./configuration/UnsavedUpdatesPanel.vue";

import { IInstanceConfiguration } from "sitewhere-rest-api";

@Component({
  components: {
    DetailPage,
    InfrastructureEditor,
    PersistenceConfigurationsEditor,
    InstanceConfigurationSource,
    UnsavedUpdatesPanel
  }
})
export default class GlobalSettings extends Vue {
  configuration: IInstanceConfiguration | null = null;
  dirty = false;
  loaded = false;

  /** Tracks updated configuration */
  workingCopy: IInstanceConfiguration | null = null;

  /** Creates a working copy of the configuration */
  @Watch("configuration", { immediate: true })
  onConfigurationUpdated(updated: IInstanceConfiguration) {
    this.workingCopy = JSON.parse(JSON.stringify(updated));
  }

  created() {
    this.refresh();
  }

  /** Get icon shown in title bar */
  get icon() {
    return NavigationIcon.Global;
  }
  /** Refresh all data */
  async refresh() {
    const response: AxiosResponse<IInstanceConfiguration> = await getInstanceConfiguration(
      this.$store
    );
    this.configuration = response.data;
    this.loaded = true;
  }

  /** Called when persistence configurations are updated */
  onPersistenceConfigurationsUpdated(): void {
    this.checkDirty();
  }

  /** Called when infrastructure settings are updated */
  onInfrastructureUpdated(): void {
    this.checkDirty();
  }

  /** Compares original with working copy for dirty check */
  checkDirty() {
    const orig: string = JSON.stringify(this.configuration);
    const work: string = JSON.stringify(this.workingCopy);
    this.dirty = orig != work;
  }

  /** Reverts to the original configuration */
  onRevertConfiguration(): void {
    if (this.configuration) {
      this.onConfigurationUpdated(this.configuration);
      this.dirty = false;
    }
  }

  /** Called to save configuration updates */
  async onSaveConfiguration() {
    if (this.workingCopy) {
      const response: AxiosResponse<IInstanceConfiguration> = await updateInstanceConfiguration(
        this.$store,
        this.workingCopy
      );
      this.configuration = response.data;
      this.onConfigurationUpdated(this.configuration);
      this.dirty = false;
    }
  }
}
</script>

<style></style>
