<template>
  <span>
    <v-icon small :color="colorForStatus">{{ iconForStatus }}</v-icon>
    <span class="caption pl-1">{{ nameForStatus }}</span>
  </span>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";

import Vue from "vue";

import { IDeviceAssignment, DeviceAssignmentStatus } from "sitewhere-rest-api";

@Component({})
export default class AssignmentStatusIndicator extends Vue {
  @Prop() readonly assignment!: IDeviceAssignment;

  /** Get icon for assignment status */
  get iconForStatus(): string {
    return this.getIconForStatus(this.assignment.status);
  }

  /** Get color for assignment status */
  get colorForStatus(): string {
    return this.getColorForStatus(this.assignment.status);
  }

  /** Get name for assignment status */
  get nameForStatus(): string {
    return this.getNameForStatus(this.assignment.status);
  }

  /** Get icon value for an assignment status */
  getIconForStatus(status?: DeviceAssignmentStatus) {
    if (status) {
      switch (status) {
        case DeviceAssignmentStatus.Active:
          return "check_circle";
        case DeviceAssignmentStatus.Missing:
          return "warning";
        case DeviceAssignmentStatus.Released:
          return "block";
      }
    }
    return "question";
  }

  /** Get color value for an assignment status */
  getColorForStatus(status?: DeviceAssignmentStatus) {
    if (status) {
      switch (status) {
        case DeviceAssignmentStatus.Active:
          return "#090";
        case DeviceAssignmentStatus.Missing:
          return "#900";
        case DeviceAssignmentStatus.Released:
          return "#ccc";
      }
    }
    return "#ccc";
  }

  /** Get name for an assignment status */
  getNameForStatus(status?: DeviceAssignmentStatus) {
    if (status) {
      switch (status) {
        case DeviceAssignmentStatus.Active:
          return "Active";
        case DeviceAssignmentStatus.Missing:
          return "Missing";
        case DeviceAssignmentStatus.Released:
          return "Released";
      }
    }
    return "Unknown Status";
  }
}
</script>
