<template>
  <list-page
    :icon="icon"
    title="Batch Operations"
    loadingMessage="Loading batch operations ..."
    :loaded="loaded"
    :results="results"
    @pagingUpdated="onPagingUpdated"
  >
    <v-flex xs12>
      <v-data-table
        :headers="headers"
        :items="matches"
        :hide-actions="true"
        no-data-text="No Batch Operations Found"
      >
        <template slot="item" slot-scope="props">
          <tr>
            <td width="15%" :title="props.item.operationType">{{ props.item.operationType }}</td>
            <td width="15%" :title="props.item.processingStatus">{{ props.item.processingStatus }}</td>
            <td
              width="20%"
              style="white-space: nowrap"
              :title="formatDate(props.item.createdDate)"
            >{{ formatDate(props.item.createdDate) }}</td>
            <td
              width="20%"
              style="white-space: nowrap"
              :title="formatDate(props.item.processingStartedDate)"
            >{{ formatDate(props.item.processingStartedDate) }}</td>
            <td
              width="20%"
              style="white-space: nowrap"
              :title="formatDate(props.item.processingEndedDate)"
            >{{ formatDate(props.item.processingEndedDate) }}</td>
            <td width="10%" title="View Batch Operation">
              <v-tooltip left>
                <v-icon
                  slot="activator"
                  @click.stop="openBatchOperation(props.item.token)"
                >navigate_next</v-icon>
                <span>Batch Operation Detail</span>
              </v-tooltip>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
    <template slot="noresults">
      <no-results-panel>
        <div>No batch operations have been created for this tenant.</div>
      </no-results-panel>
    </template>
  </list-page>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import {
  IPageSizes,
  ITableHeaders,
  NavigationIcon,
  listBatchOperations
} from "sitewhere-ide-common";
import { ListComponent, ListPage } from "sitewhere-ide-components";

import NoResultsPanel from "../common/NoResultsPanel.vue";

import { formatDate, routeTo } from "sitewhere-ide-common";
import { AxiosPromise } from "axios";
import {
  IBatchOperation,
  IBatchOperationSearchCriteria,
  IBatchOperationResponseFormat,
  IBatchOperationSearchResults
} from "sitewhere-rest-api";

@Component({
  components: {
    ListPage,
    NoResultsPanel
  }
})
export default class BatchOperationsList extends ListComponent<
  IBatchOperation,
  IBatchOperationSearchCriteria,
  IBatchOperationResponseFormat,
  IBatchOperationSearchResults
> {
  addIcon: string = NavigationIcon.Add;

  headers: ITableHeaders = [
    {
      align: "left",
      sortable: false,
      text: "Operation",
      value: "operation"
    },
    {
      align: "left",
      sortable: false,
      text: "Status",
      value: "status"
    },
    {
      align: "left",
      sortable: false,
      text: "Created",
      value: "created"
    },
    {
      align: "left",
      sortable: false,
      text: "Processing Started",
      value: "started"
    },
    {
      align: "left",
      sortable: false,
      text: "Processing Finished",
      value: "finished"
    },
    {
      align: "left",
      sortable: false,
      text: "",
      value: "open"
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
    return NavigationIcon.BatchOperation;
  }

  /** Build search criteria for list */
  buildSearchCriteria(): IBatchOperationSearchCriteria {
    const criteria: IBatchOperationSearchCriteria = {};
    return criteria;
  }

  /** Build response format for list */
  buildResponseFormat(): IBatchOperationResponseFormat {
    const format: IBatchOperationResponseFormat = {};
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: IBatchOperationSearchCriteria,
    format: IBatchOperationResponseFormat
  ): AxiosPromise<IBatchOperationSearchResults> {
    return listBatchOperations(this.$store, criteria, format);
  }

  // Open detail page for batch operation.
  openBatchOperation(token: string) {
    routeTo(this, "/batch/" + token);
  }

  // Format a date.
  formatDate(date: Date) {
    return formatDate(date);
  }
}
</script>
