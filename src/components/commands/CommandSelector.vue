<template>
  <sw-form-select
    :items="commands"
    :title="title || `Choose command`"
    :label="label || `Command`"
    item-text="name"
    item-value="token"
    v-model="wrapped"
    icon="settings"
  >
    <slot />
  </sw-form-select>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import { listDeviceCommands } from "sitewhere-ide-common";

import { handleError } from "sitewhere-ide-common";
import { AxiosResponse } from "axios";
import {
  IDeviceCommand,
  IDeviceCommandResponseFormat,
  IDeviceCommandSearchCriteria,
  IDeviceCommandSearchResults
} from "sitewhere-rest-api";

@Component({})
export default class CommandSelector extends Vue {
  @Prop(String) readonly value!: string;
  @Prop(String) readonly title!: string;
  @Prop(String) readonly label!: string;
  @Prop(String) readonly deviceTypeToken!: string;

  commands: IDeviceCommand[] = [];
  token: string | null = null;

  get wrapped(): string {
    return this.value;
  }

  set wrapped(updated: string) {
    this.$emit("input", updated);
    this.commands.forEach(command => {
      if (command.token === updated) {
        this.$emit("selected", command);
      }
    });
  }

  @Watch("deviceTypeToken")
  onDeviceTypeChanged(token: string) {
    this.loadCommandsForDeviceType(token);
  }

  /** Load list of commands for device type */
  async loadCommandsForDeviceType(token: string | null) {
    if (token != null) {
      const criteria: IDeviceCommandSearchCriteria = {
        deviceTypeToken: token,
        pageNumber: 1,
        pageSize: 0
      };
      const format: IDeviceCommandResponseFormat = {};
      try {
        const response: AxiosResponse<IDeviceCommandSearchResults> = await listDeviceCommands(
          this.$store,
          criteria,
          format
        );
        this.commands = response.data.results;
      } catch (err) {
        handleError(err);
      }
    }
  }
}
</script>