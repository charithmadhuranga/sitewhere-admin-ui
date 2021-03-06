<template>
  <list-page
    :icon="icon"
    title="Schedules"
    loadingMessage="Loading schedules ..."
    :loaded="loaded"
    :results="results"
    @pagingUpdated="onPagingUpdated"
  >
    <v-flex xs12>
      <v-data-table
        :headers="headers"
        :items="matches"
        :hide-default-footer="true"
        no-data-text="No Schedules Found"
      >
        <template slot="item" slot-scope="props">
          <tr>
            <td width="17%" :title="props.item.name">{{ props.item.name }}</td>
            <td width="15%" :title="props.item.triggerType">{{ props.item.triggerType }}</td>
            <td width="35%" :title="props.item.token">{{ props.item.token }}</td>
            <td
              width="18%"
              :title="formatDate(props.item.createdDate)"
            >{{ formatDate(props.item.createdDate) }}</td>
            <td width="15%">
              <actions-block
                @edit="onEditSchedule(props.item.token)"
                @delete="onDeleteSchedule(props.item.token)"
              />
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
    <template slot="noresults">
      <no-results-panel>
        <div>No schedules have been created for this tenant.</div>
        <div class="mt-2">
          Click
          <v-icon small class="pl-1 pr-2">{{ addIcon }}</v-icon>in the toolbar to add a schedule.
        </div>
      </no-results-panel>
    </template>
    <template slot="dialogs">
      <schedule-create-dialog ref="add" @created="onScheduleAdded" />
      <schedule-update-dialog ref="edit" @updated="refresh" />
      <schedule-delete-dialog ref="delete" @deleted="refresh" />
    </template>
    <template slot="actions">
      <add-button tooltip="Add Schedule" @action="onAddSchedule" />
    </template>
  </list-page>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import {
  IPageSizes,
  ITableHeaders,
  NavigationIcon,
  listSchedules
} from "sitewhere-ide-common";
import { ListComponent, ListPage } from "sitewhere-ide-components";

import ActionsBlock from "../common/ActionsBlock.vue";
import ScheduleCreateDialog from "./ScheduleCreateDialog.vue";
import ScheduleUpdateDialog from "./ScheduleUpdateDialog.vue";
import ScheduleDeleteDialog from "./ScheduleDeleteDialog.vue";
import AddButton from "../common/navbuttons/AddButton.vue";
import NoResultsPanel from "../common/NoResultsPanel.vue";

import { formatDate } from "sitewhere-ide-common";
import { AxiosPromise } from "axios";
import {
  ISchedule,
  IScheduleSearchCriteria,
  IScheduleResponseFormat,
  IScheduleSearchResults
} from "sitewhere-rest-api";

@Component({
  components: {
    ListPage,
    ActionsBlock,
    ScheduleCreateDialog,
    ScheduleUpdateDialog,
    ScheduleDeleteDialog,
    AddButton,
    NoResultsPanel
  }
})
export default class SchedulesList extends ListComponent<
  ISchedule,
  IScheduleSearchCriteria,
  IScheduleResponseFormat,
  IScheduleSearchResults
> {
  @Ref() readonly add!: ScheduleCreateDialog;
  @Ref() readonly edit!: ScheduleUpdateDialog;
  @Ref() readonly delete!: ScheduleDeleteDialog;

  addIcon: string = NavigationIcon.Add;

  headers: ITableHeaders = [
    {
      align: "left",
      sortable: false,
      text: "Name",
      value: "name"
    },
    {
      align: "left",
      sortable: false,
      text: "Type",
      value: "type"
    },
    {
      align: "left",
      sortable: false,
      text: "Token",
      value: "token"
    },
    {
      align: "left",
      sortable: false,
      text: "Created Date",
      value: "created"
    },
    {
      align: "left",
      sortable: false,
      text: "Actions",
      value: "actions"
    }
  ];
  pageSizes: IPageSizes = [
    {
      text: "25",
      value: 25
    },
    {
      text: "50",
      value: 50
    },
    {
      text: "100",
      value: 100
    }
  ];

  /** Get page icon */
  get icon(): NavigationIcon {
    return NavigationIcon.Schedule;
  }

  /** Build search criteria for list */
  buildSearchCriteria(): IScheduleSearchCriteria {
    const criteria: IScheduleSearchCriteria = {};
    return criteria;
  }

  /** Build response format for list */
  buildResponseFormat(): IScheduleResponseFormat {
    const format: IScheduleResponseFormat = {};
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: IScheduleSearchCriteria,
    format: IScheduleResponseFormat
  ): AxiosPromise<IScheduleSearchResults> {
    return listSchedules(this.$store, criteria, format);
  }

  /** Called to open dialog */
  onAddSchedule() {
    this.add.open();
  }

  /** Called after add */
  onScheduleAdded() {
    this.refresh();
  }

  /** Open edit dialog */
  onEditSchedule(token: string) {
    this.edit.open(token);
  }

  /** Open delete dialog */
  onDeleteSchedule(token: string) {
    this.delete.open(token);
  }

  /** Format a date */
  formatDate(date: Date) {
    return formatDate(date);
  }
}
</script>
