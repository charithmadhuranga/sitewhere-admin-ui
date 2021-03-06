<template>
  <data-table-tab
    :tabkey="tabkey"
    :loaded="loaded"
    :headers="headers"
    :results="results"
    :pageSizes="pageSizes"
    @pagingUpdated="onPagingUpdated"
    loadingMessage="Loading assignment command invocations ..."
  >
    <template slot="item" slot-scope="props">
      <tr>
        <td width="15%" :title="props.item.command.name">{{ props.item.command.name }}</td>
        <td width="45%" :title="invocationSource(props.item)">{{ invocationSource(props.item) }}</td>
        <td width="20%" :title="invocationTarget(props.item)">{{ invocationTarget(props.item) }}</td>
        <td
          width="10%"
          style="white-space: nowrap"
          :title="formatDate(props.item.eventDate)"
        >{{ formatDate(props.item.eventDate) }}</td>
        <td
          width="10%"
          style="white-space: nowrap"
          :title="formatDate(props.item.receivedDate)"
        >{{ formatDate(props.item.receivedDate) }}</td>
      </tr>
    </template>
  </data-table-tab>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import {
  IPageSizes,
  ITableHeaders,
  listCommandInvocationsForAssignment
} from "sitewhere-ide-common";
import { ListComponent, DataTableTab } from "sitewhere-ide-components";

import { AxiosPromise } from "axios";
import { formatDate } from "sitewhere-ide-common";
import { EventPageSizes, InvocationHeaders } from "../../libraries/constants";
import {
  IDeviceCommandInvocation,
  IDeviceCommandInvocationResponseFormat,
  IDeviceCommandInvocationSearchResults,
  IDateRangeSearchCriteria
} from "sitewhere-rest-api";

@Component({ components: { DataTableTab } })
export default class AssignmentResponseEvents extends ListComponent<
  IDeviceCommandInvocation,
  IDateRangeSearchCriteria,
  IDeviceCommandInvocationResponseFormat,
  IDeviceCommandInvocationSearchResults
> {
  @Prop() readonly tabkey!: string;
  @Prop() readonly token!: string;

  pageSizes: IPageSizes = EventPageSizes;
  headers: ITableHeaders = InvocationHeaders;

  /** Build search criteria for list */
  buildSearchCriteria(): IDateRangeSearchCriteria {
    const criteria: IDateRangeSearchCriteria = {};
    return criteria;
  }

  /** Build response format for list */
  buildResponseFormat(): IDeviceCommandInvocationResponseFormat {
    const format: IDeviceCommandInvocationResponseFormat = {};
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: IDateRangeSearchCriteria,
    format: IDeviceCommandInvocationResponseFormat
  ): AxiosPromise<IDeviceCommandInvocationSearchResults> {
    return listCommandInvocationsForAssignment(
      this.$store,
      this.token,
      criteria,
      format
    );
  }

  /** Make function available to template */
  formatDate(date: Date) {
    return formatDate(date);
  }

  /** Gets source information for an invocation */
  invocationSource(invocation: IDeviceCommandInvocation) {
    return invocation.initiator + " (" + invocation.initiatorId + ")";
  }

  /** Gets source information for an invocation */
  invocationTarget(invocation: IDeviceCommandInvocation) {
    return invocation.target;
  }
}
</script>
