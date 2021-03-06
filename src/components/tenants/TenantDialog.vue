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
      <v-tab key="branding">Branding</v-tab>
      <v-tab key="metadata">Metadata</v-tab>
    </template>
    <template slot="tab-items">
      <v-tab-item key="details" eager>
        <tenant-detail-fields ref="details" :mode="mode" />
      </v-tab-item>
      <v-tab-item key="branding" eager>
        <branding-panel ref="branding" />
      </v-tab-item>
      <v-tab-item key="metadata" eager>
        <metadata-panel ref="metadata" />
      </v-tab-item>
    </template>
  </base-dialog>
</template>

<script lang="ts">
import { Component, Ref, Prop } from "vue-property-decorator";
import { ITabbedComponent, NavigationIcon } from "sitewhere-ide-common";
import {
  DialogComponent,
  BaseDialog,
  BrandingPanel,
  MetadataPanel,
} from "sitewhere-ide-components";

import TenantDetailFields from "./TenantDetailFields.vue";
import { ITenant, IBrandedEntity } from "sitewhere-rest-api";

@Component({
  components: {
    TenantDetailFields,
    BrandingPanel,
    MetadataPanel,
    BaseDialog,
  },
})
export default class TenantDialog extends DialogComponent<ITenant> {
  @Prop() readonly mode!: string;
  @Ref() readonly dialog!: ITabbedComponent;
  @Ref() readonly details!: TenantDetailFields;
  @Ref() readonly branding!: BrandingPanel;
  @Ref() readonly metadata!: MetadataPanel;

  /** Get icon for dialog */
  get icon(): NavigationIcon {
    return NavigationIcon.Tenant;
  }

  // Generate payload from UI.
  generatePayload() {
    const payload: any = {};
    Object.assign(
      payload,
      this.details.save(),
      this.branding.save(),
      this.metadata.save()
    );
    return payload;
  }

  // Reset dialog contents.
  reset() {
    if (this.details) {
      this.details.reset();
    }
    if (this.branding) {
      this.branding.reset();
    }
    if (this.metadata) {
      this.metadata.reset();
    }
    this.dialog.setActiveTab(0);
  }

  // Load dialog from a given payload.
  load(payload: ITenant) {
    this.reset();
    if (this.details) {
      this.details.load(payload);
    }
    if (this.branding) {
      const bpayload: IBrandedEntity = {
        id: payload.token,
        token: payload.token,
        createdDate: new Date(),
        createdBy: "",
        backgroundColor: payload.backgroundColor,
        foregroundColor: payload.foregroundColor,
        borderColor: payload.borderColor,
        icon: payload.icon,
        imageUrl: payload.imageUrl,
        updatedDate: undefined,
        updatedBy: "",
        metadata: payload.metadata,
      };
      this.branding.load(bpayload);
    }
    if (this.metadata) {
      this.metadata.load(payload);
    }
  }

  // Called after create button is clicked.
  onCreateClicked() {
    if (!this.details.validate()) {
      this.dialog.setActiveTab(0);
      return;
    }

    if (!this.branding.validate()) {
      this.dialog.setActiveTab(1);
      return;
    }

    const payload = this.generatePayload();
    this.$emit("payload", payload);
  }
}
</script>
