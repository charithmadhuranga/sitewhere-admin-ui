<template>
  <list-tab :tabkey="tabkey" :loaded="loaded" :results="results" @pagingUpdated="onPagingUpdated">
    <list-layout>
      <v-flex xs6 v-for="customer in matches" :key="customer.token">
        <customer-list-entry :customer="customer" @open="onOpenCustomer" />
      </v-flex>
    </list-layout>
    <template slot="noresults">
      <no-results-panel>
        <div>This customer has no subcustomers.</div>
        <div class="mt-2">
          Click
          <v-icon class="pl-1 pr-2">{{ custIcon }}</v-icon>in the toolbar to add a subcustomer.
        </div>
      </no-results-panel>
    </template>
    <template slot="dialogs">
      <customer-create-dialog @customerAdded="refresh" :parentCustomer="customer" />
    </template>
  </list-tab>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { NavigationIcon, listCustomers } from "sitewhere-ide-common";
import { ListComponent, ListTab, ListLayout } from "sitewhere-ide-components";

import CustomerListEntry from "./CustomerListEntry.vue";
import CustomerCreateDialog from "./CustomerCreateDialog.vue";
import NoResultsPanel from "../common/NoResultsPanel.vue";

import { routeTo } from "sitewhere-ide-common";
import { AxiosPromise } from "axios";
import {
  ICustomer,
  ICustomerSearchCriteria,
  ICustomerResponseFormat,
  ICustomerSearchResults
} from "sitewhere-rest-api";

@Component({
  components: {
    ListTab,
    ListLayout,
    CustomerListEntry,
    CustomerCreateDialog,
    NoResultsPanel
  }
})
export default class CustomerSubcustomers extends ListComponent<
  ICustomer,
  ICustomerSearchCriteria,
  ICustomerResponseFormat,
  ICustomerSearchResults
> {
  @Prop() readonly tabkey!: string;
  @Prop() readonly customer!: ICustomer;

  custIcon: string = NavigationIcon.Customer;

  /** Build search criteria for list */
  buildSearchCriteria(): ICustomerSearchCriteria {
    const criteria: ICustomerSearchCriteria = {};
    criteria.rootOnly = false;
    criteria.parentCustomerToken = this.customer.token;
    return criteria;
  }

  /** Build response format for list */
  buildResponseFormat(): ICustomerResponseFormat {
    const format: ICustomerResponseFormat = {};
    format.includeCustomerType = true;
    format.includeParentCustomer = false;
    return format;
  }

  /** Perform search */
  performSearch(
    criteria: ICustomerSearchCriteria,
    format: ICustomerResponseFormat
  ): AxiosPromise<ICustomerSearchResults> {
    return listCustomers(this.$store, criteria, format);
  }

  /** Open device assignment detail page */
  onOpenCustomer(customer: ICustomer) {
    routeTo(this, "/customers/" + customer.token);
  }
}
</script>
