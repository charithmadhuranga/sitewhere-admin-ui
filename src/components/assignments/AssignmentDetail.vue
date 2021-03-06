<template>
  <detail-page
    :icon="icon"
    :title="title"
    loadingMessage="Loading assignment ..."
    :loaded="loaded"
    :record="assignment"
  >
    <template slot="header">
      <assignment-detail-header :record="assignment" @statusUpdated="refresh" />
    </template>
    <template slot="tabs">
      <v-tab key="locations">Locations</v-tab>
      <v-tab key="measurements">Measurements</v-tab>
      <v-tab key="alerts">Alerts</v-tab>
      <v-tab key="invocations">Commands</v-tab>
      <v-tab key="responses">Responses</v-tab>
    </template>
    <template slot="tab-items">
      <assignment-location-events tabkey="locations" :token="token" />
      <assignment-measurement-events tabkey="measurements" :token="token" />
      <assignment-alert-events tabkey="alerts" :token="token" />
      <assignment-invocation-events tabkey="invocations" :token="token" />
      <assignment-response-events tabkey="responses" :token="token" />
    </template>
    <template slot="dialogs">
      <invocation-create-dialog
        ref="invoke"
        :assignmentToken="token"
        :deviceTypeToken="deviceTypeToken"
        @invocationAdded="onInvocationAdded"
      />
      <assignment-delete-dialog
        ref="delete"
        :token="token"
        @assignmentDeleted="onAssignmentDeleted"
      />
    </template>
    <template slot="actions">
      <device-command-button tooltip="Invoke Command" @action="onAddCommandInvocation" />
      <emulator-button tooltip="Device Emulator" @action="onOpenEmulator" />
      <delete-button tooltip="Delete Assignment" @action="onAssignmentDelete" />
    </template>
  </detail-page>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { NavigationIcon, getDeviceAssignment } from "sitewhere-ide-common";
import { DetailComponent, DetailPage } from "sitewhere-ide-components";

import AssignmentDetailHeader from "./AssignmentDetailHeader.vue";
import AssignmentLocationEvents from "./AssignmentLocationEvents.vue";
import AssignmentMeasurementEvents from "./AssignmentMeasurementEvents.vue";
import AssignmentAlertEvents from "./AssignmentAlertEvents.vue";
import AssignmentInvocationEvents from "./AssignmentInvocationEvents.vue";
import AssignmentResponseEvents from "./AssignmentResponseEvents.vue";
import AssignmentDeleteDialog from "./AssignmentDeleteDialog.vue";
import InvocationCreateDialog from "./InvocationCreateDialog.vue";
import DeviceCommandButton from "../common/navbuttons/DeviceCommandButton.vue";
import EmulatorButton from "../common/navbuttons/EmulatorButton.vue";
import DeleteButton from "../common/navbuttons/DeleteButton.vue";

import { routeTo } from "sitewhere-ide-common";
import { AxiosPromise } from "axios";
import {
  IDevice,
  IDeviceType,
  IDeviceAssignment,
  IDeviceAssignmentResponseFormat
} from "sitewhere-rest-api";
import { DeviceAssignmentsSection } from "../../libraries/constants";

@Component({
  components: {
    DetailPage,
    AssignmentDetailHeader,
    AssignmentLocationEvents,
    AssignmentMeasurementEvents,
    AssignmentAlertEvents,
    AssignmentInvocationEvents,
    AssignmentResponseEvents,
    AssignmentDeleteDialog,
    InvocationCreateDialog,
    DeviceCommandButton,
    EmulatorButton,
    DeleteButton
  }
})
export default class AssignmentDetail extends DetailComponent<
  IDeviceAssignment
> {
  @Ref() readonly invoke!: InvocationCreateDialog;

  /** Record as assignment */
  get assignment(): IDeviceAssignment | null {
    return this.record;
  }

  /** Device for assignment */
  get device(): IDevice | null {
    return this.assignment ? (this.assignment as any).device : null;
  }

  /** Device type for assignment */
  get deviceType(): IDeviceType | null {
    return this.device ? (this.device as any).deviceType : null;
  }

  /** Device type token for assignment */
  get deviceTypeToken(): string | null {
    return this.deviceType ? this.deviceType.token : null;
  }

  /** Icon for page */
  get icon(): NavigationIcon {
    return NavigationIcon.DeviceAssignment;
  }

  /** Get page title */
  get title(): string {
    return this.assignment ? this.assignment.token : "";
  }

  /** Load record */
  loadRecord(token: string): AxiosPromise<IDeviceAssignment> {
    const format: IDeviceAssignmentResponseFormat = {
      includeDevice: true
    };
    return getDeviceAssignment(this.$store, token, format);
  }

  /** Called after data is loaded */
  afterRecordLoaded() {
    this.$store.commit("currentSection", DeviceAssignmentsSection);
  }

  onAssignmentDelete() {
    console.log("Would be deleting assignment");
  }

  /** Called when site is deleted */
  onAssignmentDeleted() {
    routeTo(this, "/areas");
  }

  /** Called to open assignment emulator */
  onOpenEmulator() {
    routeTo(this, "/assignments/" + this.$data.token + "/emulator");
  }

  /** Called to create command invocation */
  onAddCommandInvocation() {
    this.invoke.open();
  }

  /** Called after invocation is added */
  onInvocationAdded() {
    console.log("Invocation added");
  }
}
</script>
