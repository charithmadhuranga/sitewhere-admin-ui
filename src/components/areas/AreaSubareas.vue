<template>
  <list-tab :tabkey="tabkey" :loaded="loaded" :results="results" @pagingUpdated="onPagingUpdated">
    <list-layout>
      <v-flex xs6 v-for="area in matches" :key="area.token">
        <area-list-entry :area="area" @open="onOpenArea" />
      </v-flex>
    </list-layout>
    <template slot="noresults">
      <no-results-panel>
        <div>This area has no subareas.</div>
        <div class="mt-2">
          Click
          <v-icon class="pl-1 pr-2">{{ areaIcon }}</v-icon>in the toolbar to add a subarea.
        </div>
      </no-results-panel>
    </template>
    <template slot="dialogs">
      <area-create-dialog @areaAdded="refresh" />
    </template>
  </list-tab>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { NavigationIcon, listAreas, routeTo } from "sitewhere-ide-common";
import { ListComponent, ListTab, ListLayout } from "sitewhere-ide-components";

import AreaListEntry from "./AreaListEntry.vue";
import AreaCreateDialog from "./AreaCreateDialog.vue";
import NoResultsPanel from "../common/NoResultsPanel.vue";

import { AxiosPromise } from "axios";
import {
  IArea,
  IAreaSearchCriteria,
  IAreaResponseFormat,
  IAreaSearchResults
} from "sitewhere-rest-api";

@Component({
  components: {
    ListTab,
    ListLayout,
    AreaListEntry,
    AreaCreateDialog,
    NoResultsPanel
  }
})
export default class AreaSubareas extends ListComponent<
  IArea,
  IAreaSearchCriteria,
  IAreaResponseFormat,
  IAreaSearchResults
> {
  @Prop() readonly tabkey!: string;
  @Prop() readonly areaToken!: string;

  areaIcon: string = NavigationIcon.Area;

  /** Build search criteria for list */
  buildSearchCriteria(): IAreaSearchCriteria {
    const criteria: IAreaSearchCriteria = {};
    criteria.rootOnly = false;
    criteria.parentAreaToken = this.areaToken;
    return criteria;
  }

  /** Build response format for list */
  buildResponseFormat(): IAreaResponseFormat {
    const format: IAreaResponseFormat = {};
    format.includeAreaType = true;
    format.includeAssignments = false;
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: IAreaSearchCriteria,
    format: IAreaResponseFormat
  ): AxiosPromise<IAreaSearchResults> {
    return listAreas(this.$store, criteria, format);
  }

  // Called to open an area.
  onOpenArea(area: IArea) {
    routeTo(this, "/areas/" + area.token);
  }
}
</script>
