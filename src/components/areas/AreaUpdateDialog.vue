<template>
  <area-dialog
    ref="dialog"
    title="Edit Area"
    :loaded="loaded"
    createLabel="Update"
    cancelLabel="Cancel"
    :parentArea="parentArea"
    @payload="onSave"
  />
</template>

<script lang="ts">
import { Component, Ref, Prop } from "vue-property-decorator";
import { getArea, updateArea } from "sitewhere-ide-common";
import { EditDialogComponent, DialogComponent } from "sitewhere-ide-components";

import AreaDialog from "./AreaDialog.vue";

import { AxiosPromise } from "axios";
import {
  IArea,
  IAreaCreateRequest,
  IAreaResponseFormat,
} from "sitewhere-rest-api";

@Component({
  components: {
    AreaDialog,
  },
})
export default class AreaUpdateDialog extends EditDialogComponent<
  IArea,
  IAreaCreateRequest
> {
  @Prop() readonly parentArea!: IArea;
  @Ref() readonly dialog!: DialogComponent<IArea>;

  /** Get wrapped dialog */
  getDialog(): DialogComponent<IArea> {
    return this.dialog;
  }

  /** Load payload */
  prepareLoad(identifier: string): AxiosPromise<IArea> {
    const format: IAreaResponseFormat = { includeAreaType: true };
    return getArea(this.$store, identifier, format);
  }

  /** Save payload */
  prepareSave(
    original: IArea,
    updated: IAreaCreateRequest
  ): AxiosPromise<IArea> {
    return updateArea(this.$store, original.token, updated);
  }

  /** Called on payload commit */
  onSave(payload: IAreaCreateRequest): void {
    this.save(payload);
  }

  /** Implemented in subclasses for after-save */
  afterSave(payload: IArea): void {
    this.$emit("areaUpdated", payload);
  }
}
</script>
