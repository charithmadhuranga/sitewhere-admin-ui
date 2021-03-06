<template>
  <zone-dialog
    :area="area"
    title="Create Zone"
    width="700"
    ref="dialog"
    createLabel="Create"
    cancelLabel="Cancel"
    mode="create"
    @payload="onCommit"
  />
</template>

<script lang="ts">
import { Component, Prop, Ref } from "vue-property-decorator";
import { createZone } from "sitewhere-ide-common";
import {
  CreateDialogComponent,
  DialogComponent
} from "sitewhere-ide-components";

import ZoneDialog from "./ZoneDialog.vue";

import { AxiosPromise } from "axios";
import { IZone, IZoneCreateRequest, IArea } from "sitewhere-rest-api";

@Component({
  components: {
    ZoneDialog
  }
})
export default class ZoneCreateDialog extends CreateDialogComponent<
  IZone,
  IZoneCreateRequest
> {
  @Prop() readonly area!: IArea;
  @Ref() readonly dialog!: DialogComponent<IZone>;

  /** Get wrapped dialog */
  getDialog(): DialogComponent<IZone> {
    return this.dialog;
  }

  /** Called on payload commit */
  onCommit(payload: IZoneCreateRequest): void {
    this.commit(payload);
  }

  /** Implemented in subclasses to save payload */
  save(payload: IZoneCreateRequest): AxiosPromise<IZone> {
    payload.areaToken = this.area.token;
    return createZone(this.$store, payload);
  }

  /** Implemented in subclasses for after-save */
  afterSave(payload: IZone): void {
    this.$emit("zoneAdded", payload);
  }
}
</script>
