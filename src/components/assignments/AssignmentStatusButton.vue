<template>
  <div>
    <confirm-dialog
      ref="dialog"
      buttonText="Update"
      title="Update Assignment Status"
      width="400"
      @confirmed="onExecuteAction"
    >
      <v-card-text>Are you sure you want to update the assignment status?</v-card-text>
    </confirm-dialog>
    <span v-if="assignment.status === 'Released'">Released</span>
    <v-menu offset-y v-else-if="assignment.status === 'Active'">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" small class="green darken-2 white--text" slot="activator">Active</v-btn>
      </template>
      <v-list>
        <v-list-item
          @click.stop="confirmFirst(item.action)"
          v-for="item in statusActiveItems"
          :key="item.text"
        >
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y v-else-if="assignment.status === 'Missing'">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" small class="red darken-2 white--text" slot="activator">Missing</v-btn>
      </template>
      <v-list>
        <v-list-item
          @click.stop="confirmFirst(item.action)"
          v-for="item in statusMissingItems"
          :key="item.text"
        >
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Ref } from "vue-property-decorator";
import { releaseAssignment, missingAssignment } from "sitewhere-ide-common";

import { ConfirmDialog } from "sitewhere-ide-components";

import { AxiosResponse } from "axios";
import { IDeviceAssignment } from "sitewhere-rest-api";

@Component({ components: { ConfirmDialog } })
export default class AssignmentStatusButton extends Vue {
  @Prop() readonly assignment!: IDeviceAssignment;
  @Ref() readonly dialog!: any;

  action: () => any = function() {};
  statusActiveItems: { text: string; action: () => any }[] = [
    {
      text: "Release Assignment",
      action: this.onReleaseAssignment
    },
    {
      text: "Report Missing",
      action: this.onMissingAssignment
    }
  ];
  statusMissingItems: { text: string; action: () => any }[] = [
    {
      text: "Release Assignment",
      action: this.onReleaseAssignment
    }
  ];

  /** Store the action and open confirmation */
  confirmFirst(action: () => any) {
    this.action = action;
    this.dialog.open();
  }

  /** Executes action after confirmation */
  onExecuteAction() {
    this.action();
  }

  /** Called to mark an assignment as released */
  async onReleaseAssignment() {
    const response: AxiosResponse<IDeviceAssignment> = await releaseAssignment(
      this.$store,
      this.assignment.token
    );
    this.onStatusUpdated(response.data);
  }

  /** Called to mark an assignment as missing */
  async onMissingAssignment() {
    const response: AxiosResponse<IDeviceAssignment> = await missingAssignment(
      this.$store,
      this.assignment.token
    );
    this.onStatusUpdated(response.data);
  }

  /** Handle successful update */
  onStatusUpdated(result: any) {
    console.log(result);
    this.$emit("updated");
  }
}
</script>
