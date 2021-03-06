<template>
  <list-page
    :icon="icon"
    title="Asset Types"
    loadingMessage="Loading asset types ..."
    :loaded="loaded"
    :results="results"
    @pagingUpdated="onPagingUpdated"
  >
    <list-layout>
      <v-flex xs6 v-for="assetType in matches" :key="assetType.token">
        <asset-type-list-entry
          :assetType="assetType"
          @assetTypeOpened="onOpenAssetType"
          @assetTypeDeleted="refresh"
        ></asset-type-list-entry>
      </v-flex>
    </list-layout>
    <template slot="noresults">
      <no-results-panel>
        <div>No asset types have been created for this tenant.</div>
        <div class="mt-2">
          Click
          <v-icon small class="pl-1 pr-2">{{ addIcon }}</v-icon>in the toolbar to add an asset type.
        </div>
      </no-results-panel>
    </template>
    <template slot="dialogs">
      <asset-type-create-dialog ref="add" @assetTypeAdded="refresh" />
    </template>
    <template slot="actions">
      <add-button tooltip="Add Asset Type" @action="onAddAssetType" />
    </template>
  </list-page>
</template>

<script lang="ts">
import { Component, Ref } from "vue-property-decorator";
import { NavigationIcon, listAssetTypes } from "sitewhere-ide-common";
import { ListComponent, ListPage, ListLayout } from "sitewhere-ide-components";

import AssetTypeListEntry from "./AssetTypeListEntry.vue";
import AssetTypeCreateDialog from "./AssetTypeCreateDialog.vue";
import AddButton from "../common/navbuttons/AddButton.vue";
import NoResultsPanel from "../common/NoResultsPanel.vue";

import { routeTo } from "sitewhere-ide-common";
import { AxiosPromise } from "axios";
import {
  IAssetType,
  IAssetTypeSearchCriteria,
  IAssetTypeResponseFormat,
  IAssetTypeSearchResults
} from "sitewhere-rest-api";

@Component({
  components: {
    ListPage,
    ListLayout,
    AssetTypeListEntry,
    AssetTypeCreateDialog,
    AddButton,
    NoResultsPanel
  }
})
export default class AssetTypesList extends ListComponent<
  IAssetType,
  IAssetTypeSearchCriteria,
  IAssetTypeResponseFormat,
  IAssetTypeSearchResults
> {
  @Ref() readonly add!: AssetTypeCreateDialog;

  addIcon: string = NavigationIcon.Add;

  /** Get page icon */
  get icon(): NavigationIcon {
    return NavigationIcon.AssetType;
  }

  /** Build search criteria for list */
  buildSearchCriteria(): IAssetTypeSearchCriteria {
    const criteria: IAssetTypeSearchCriteria = {};
    return criteria;
  }

  /** Build response format for list */
  buildResponseFormat(): IAssetTypeResponseFormat {
    const format: IAssetTypeResponseFormat = {};
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: IAssetTypeSearchCriteria,
    format: IAssetTypeResponseFormat
  ): AxiosPromise<IAssetTypeSearchResults> {
    return listAssetTypes(this.$store, criteria, format);
  }

  // Called on open.
  onOpenAssetType(assetType: IAssetType) {
    routeTo(this, "/assettypes/" + assetType.token);
  }

  // Called to open dialog.
  onAddAssetType() {
    this.add.open();
  }
}
</script>
