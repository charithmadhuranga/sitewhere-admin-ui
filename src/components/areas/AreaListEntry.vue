<template>
  <list-entry style="min-height: 140px">
    <v-container @click="onAreaClicked">
      <v-layout row>
        <v-flex xs3>
          <branding-image :style="logoStyle" :entity="area" />
        </v-flex>
        <v-flex xs9>
          <div>
            <div class="title ellipsis mb-1">{{ area.name }}</div>
            <div class="areadesc caption">{{ area.description }}</div>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </list-entry>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import BrandingImage from "../common/BrandingImage.vue";
import { ListEntry } from "sitewhere-ide-components";

import { IArea } from "sitewhere-rest-api";
import { IStyle } from "../common/Style";

@Component({
  components: {
    ListEntry,
    BrandingImage
  }
})
export default class AreaListEntry extends Vue {
  @Prop() readonly area!: IArea;

  // Compute style of logo.
  get logoStyle(): IStyle {
    return {
      height: "120px",
      width: "120px",
      "padding-left": "15px"
    };
  }

  // Handle area clicked.
  onAreaClicked() {
    this.$emit("open", this.area);
  }
}
</script>

<style scoped>
.areadesc {
  height: 40px;
  overflow-y: hidden;
}
</style>
