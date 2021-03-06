<template>
  <list-page
    :icon="icon"
    title="Manage Devices"
    loadingMessage="Loading devices ..."
    :loaded="loaded"
    :results="results"
    :pageSizes="pageSizes"
    @pagingUpdated="onPagingUpdated"
  >
    <list-layout>
      <v-flex xs6 v-for="device in matches" :key="device.token">
        <device-list-entry :device="device" @assign="onAssignDevice" @open="onOpenDevice" />
      </v-flex>
    </list-layout>
    <template slot="filters">
      <device-list-filter-bar ref="filters" :criteria="filter" @clear="onClearFilterCriteria" />
    </template>
    <template slot="noresults">
      <no-results-panel>
        <div>No devices have been created for this tenant.</div>
        <div class="mt-2">
          Click
          <v-icon small class="pl-1 pr-2">{{ addIcon }}</v-icon>in the toolbar to add a device.
        </div>
      </no-results-panel>
    </template>
    <template slot="dialogs">
      <device-create-dialog ref="add" @deviceAdded="onDeviceAdded" />
      <assignment-create-dialog ref="assign" :device="selected" @created="onAssignmentCreated" />
      <invocation-by-device-criteria-create-dialog :filter="filter" ref="batch" />
      <device-list-filter-dialog ref="filterDialog" @payload="onFilterUpdated" />
    </template>
    <template slot="actions">
      <add-button tooltip="Add Device" @action="onAddDevice" />
      <device-command-button
        v-if="filter.deviceTypeToken"
        tooltip="Execute Batch Command"
        @action="onBatchCommandInvocation"
      />
      <filter-button tooltip="Filter Device List" @action="onShowFilterCriteria" />
    </template>
  </list-page>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import {
  IPageSizes,
  NavigationIcon,
  listDeviceSummaries,
} from "sitewhere-ide-common";
import { ListComponent, ListPage, ListLayout } from "sitewhere-ide-components";

import DeviceListEntry from "./DeviceListEntry.vue";
import DeviceListFilterBar from "./DeviceListFilterBar.vue";
import DeviceListFilterDialog from "./DeviceListFilterDialog.vue";
import DeviceCreateDialog from "./DeviceCreateDialog.vue";
import AssignmentCreateDialog from "../assignments/AssignmentCreateDialog.vue";
import InvocationByDeviceCriteriaCreateDialog from "../batch/InvocationByDeviceCriteriaCreateDialog.vue";
import AddButton from "../common/navbuttons/AddButton.vue";
import DeviceCommandButton from "../common/navbuttons/DeviceCommandButton.vue";
import FilterButton from "../common/navbuttons/FilterButton.vue";
import NoResultsPanel from "../common/NoResultsPanel.vue";

import { routeTo } from "sitewhere-ide-common";
import { AxiosPromise } from "axios";
import {
  IDeviceSummary,
  IDeviceSearchCriteria,
  IDeviceResponseFormat,
  IDeviceSummarySearchResults,
} from "sitewhere-rest-api";

@Component({
  components: {
    ListPage,
    ListLayout,
    DeviceListEntry,
    DeviceListFilterBar,
    DeviceListFilterDialog,
    DeviceCreateDialog,
    AssignmentCreateDialog,
    InvocationByDeviceCriteriaCreateDialog,
    AddButton,
    DeviceCommandButton,
    FilterButton,
    NoResultsPanel,
  },
})
export default class DevicesList extends ListComponent<
  IDeviceSummary,
  IDeviceSearchCriteria,
  IDeviceResponseFormat,
  IDeviceSummarySearchResults
> {
  @Ref() readonly add!: DeviceCreateDialog;
  @Ref() readonly assign!: AssignmentCreateDialog;
  @Ref() readonly filterDialog!: DeviceListFilterDialog;
  @Ref() readonly batch!: InvocationByDeviceCriteriaCreateDialog;

  addIcon: string = NavigationIcon.Add;

  selected: IDeviceSummary | null = null;
  filter: IDeviceSearchCriteria = {};
  pageSizes: IPageSizes = [
    {
      text: "20",
      value: 20,
    },
    {
      text: "50",
      value: 50,
    },
    {
      text: "100",
      value: 100,
    },
  ];

  /** Get page icon */
  get icon(): NavigationIcon {
    return NavigationIcon.Device;
  }

  /** Build search criteria for list */
  buildSearchCriteria(): IDeviceSearchCriteria {
    return this.filter;
  }

  /** Build response format for list */
  buildResponseFormat(): IDeviceResponseFormat {
    const format: IDeviceResponseFormat = {};
    format.includeDeviceType = true;
    format.includeAssignment = true;
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: IDeviceSearchCriteria
  ): AxiosPromise<IDeviceSummarySearchResults> {
    return listDeviceSummaries(this.$store, criteria);
  }

  /** Called to show filter criteria dialog */
  onShowFilterCriteria() {
    this.filterDialog.openDialog();
  }

  /** Clears the filter criteria */
  onClearFilterCriteria() {
    this.filter = {};
    this.filterDialog.reset();
    this.refresh();
  }

  /** Called when filter criteria are updated */
  onFilterUpdated(filter: IDeviceSearchCriteria) {
    this.filterDialog.closeDialog();
    this.filter = filter;
    this.refresh();
  }

  /** Open device assignment dialog */
  onAssignDevice(device: IDeviceSummary) {
    this.selected = device;
    this.assign.open();
  }

  /** Called after new assignment is created */
  onAssignmentCreated() {
    this.refresh();
  }

  /** Called when a new device is added */
  onDeviceAdded() {
    this.refresh();
  }

  /** Called to open detail page for device */
  onOpenDevice(device: IDeviceSummary) {
    routeTo(this, "/devices/" + device.token);
  }

  /** Called to open dialog */
  onAddDevice() {
    this.add.open();
  }

  /** Called to invoke a batch command */
  onBatchCommandInvocation() {
    this.batch.open();
  }
}
</script>
