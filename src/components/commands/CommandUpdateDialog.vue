<template>
  <command-dialog
    ref="dialog"
    title="Edit Command"
    :loaded="loaded"
    createLabel="Update"
    cancelLabel="Cancel"
    @payload="onSave"
  />
</template>

<script lang="ts">
import { Component, Prop, Ref } from "vue-property-decorator";
import { getDeviceCommand, updateDeviceCommand } from "sitewhere-ide-common";
import { EditDialogComponent } from "sitewhere-ide-components";

import CommandDialog from "./CommandDialog.vue";

import { AxiosPromise } from "axios";
import {
  IDeviceCommand,
  IDeviceCommandCreateRequest,
  IDeviceCommandResponseFormat
} from "sitewhere-rest-api";

@Component({
  components: {
    CommandDialog
  }
})
export default class CommandUpdateDialog extends EditDialogComponent<
  IDeviceCommand,
  IDeviceCommandCreateRequest
> {
  @Prop() readonly deviceTypeToken!: string;
  @Ref() readonly dialog!: CommandDialog;

  /** Get wrapped dialog */
  getDialog(): CommandDialog {
    return this.dialog;
  }

  /** Load payload */
  prepareLoad(token: string): AxiosPromise<IDeviceCommand> {
    const format: IDeviceCommandResponseFormat = { includeCustomerType: true };
    return getDeviceCommand(this.$store, this.deviceTypeToken, token, format);
  }

  /** Save payload */
  prepareSave(
    original: IDeviceCommand,
    updated: IDeviceCommandCreateRequest
  ): AxiosPromise<IDeviceCommand> {
    return updateDeviceCommand(
      this.$store,
      this.deviceTypeToken,
      original.token,
      updated
    );
  }

  /** Called on payload commit */
  onSave(payload: IDeviceCommandCreateRequest): void {
    this.save(payload);
  }

  /** Implemented in subclasses for after-save */
  afterSave(payload: IDeviceCommand): void {
    this.$emit("commandUpdated", payload);
  }
}
</script>
