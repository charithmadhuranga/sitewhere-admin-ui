<template>
  <zone-dialog
    :area="area"
    title="Update Zone"
    width="700"
    ref="dialog"
    createLabel="Update"
    cancelLabel="Cancel"
    @payload="onSave"
  />
</template>

<script lang="ts">
import { Component, Prop, Ref } from "vue-property-decorator";
import { getZone, updateZone } from "sitewhere-ide-common";
import { EditDialogComponent, DialogComponent } from "sitewhere-ide-components";

import ZoneDialog from "./ZoneDialog.vue";

import { AxiosPromise } from "axios";
import { IArea, IZone, IZoneCreateRequest } from "sitewhere-rest-api";

@Component({
  components: {
    ZoneDialog
  }
})
export default class ZoneUpdateDialog extends EditDialogComponent<
  IZone,
  IZoneCreateRequest
> {
  @Prop() readonly area!: IArea;
  @Ref() readonly dialog!: DialogComponent<IZone>;

  /** Get wrapped dialog */
  getDialog(): DialogComponent<IZone> {
    return this.dialog;
  }

  /** Load payload */
  prepareLoad(identifier: string): AxiosPromise<IZone> {
    return getZone(this.$store, identifier);
  }

  /** Save payload */
  prepareSave(
    original: IZone,
    updated: IZoneCreateRequest
  ): AxiosPromise<IZone> {
    return updateZone(this.$store, original.token, updated);
  }

  /** Called on payload commit */
  onSave(payload: IZoneCreateRequest): void {
    this.save(payload);
  }
}
</script>
