<template>
  <base-dialog
    ref="dialog"
    :icon="icon"
    :title="title"
    :width="width"
    :loaded="loaded"
    :visible="dialogVisible"
    :createLabel="createLabel"
    :cancelLabel="cancelLabel"
    @createClicked="onCreateClicked"
    @cancelClicked="onCancelClicked"
  >
    <template slot="tabs">
      <v-tab key="details">Details</v-tab>
      <v-tab key="metadata">Metadata</v-tab>
    </template>
    <template slot="tab-items">
      <v-tab-item key="details" eager>
        <zone-detail-fields :area="area" :mapVisible="mapVisible" ref="details" />
      </v-tab-item>
      <v-tab-item key="metadata" eager>
        <metadata-panel ref="metadata" />
      </v-tab-item>
    </template>
  </base-dialog>
</template>

<script lang="ts">
import { Component, Prop, Ref } from "vue-property-decorator";
import { ITabbedComponent, NavigationIcon } from "sitewhere-ide-common";
import {
  DialogComponent,
  DialogSection,
  BaseDialog,
  MetadataPanel
} from "sitewhere-ide-components";

import ZoneDetailFields from "./ZoneDetailFields.vue";
import { IZone, IArea } from "sitewhere-rest-api";

@Component({
  components: {
    BaseDialog,
    ZoneDetailFields,
    MetadataPanel
  }
})
export default class ZoneDialog extends DialogComponent<IZone> {
  @Prop() readonly area!: IArea;
  @Ref() readonly dialog!: ITabbedComponent;
  @Ref() readonly details!: DialogSection;
  @Ref() readonly metadata!: DialogSection;

  mapVisible = false;

  /** Get icon for dialog */
  get icon(): NavigationIcon {
    return NavigationIcon.Zone;
  }

  /** Generate payload from UI */
  generatePayload() {
    const payload: any = {};
    Object.assign(payload, this.details.save(), this.metadata.save());
    return payload;
  }

  /** Reset dialog contents */
  reset() {
    this.mapVisible = true;
    if (this.details) {
      this.details.reset();
    }
    if (this.metadata) {
      this.metadata.reset();
    }
    this.dialog.setActiveTab(0);
  }

  /** Load dialog from a given payload */
  load(payload: IZone) {
    this.reset();
    if (this.details) {
      this.details.load(payload);
    }
    if (this.metadata) {
      this.metadata.load(payload);
    }
  }

  /** Called after create button is clicked */
  onCreateClicked() {
    if (!this.details.validate()) {
      this.dialog.setActiveTab(0);
      return;
    }

    const payload = this.generatePayload();
    console.log("Before payload emit:", this);
    this.$emit("payload", payload);
  }
}
</script>
