<template>
  <list-entry>
    <v-container fluid @click="onAssetClicked">
      <v-layout row>
        <v-flex xs2>
          <branding-image :style="logoStyle" :entity="assetOrAssetType" />
        </v-flex>
        <v-flex xs10>
          <div>
            <div class="title ellipsis mb-1">{{ asset.name }}</div>
            <div class="subtitle-2 mb-4">{{ asset.token }}</div>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </list-entry>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";

import BrandingImage from "../common/BrandingImage.vue";
import { ListEntry } from "sitewhere-ide-components";

import { IStyle } from "../common/Style";
import { IAsset, IBrandedEntity } from "sitewhere-rest-api";

@Component({
  components: {
    ListEntry,
    BrandingImage
  }
})
export default class AssetListEntry extends Vue {
  @Prop() readonly asset!: IAsset;

  /** Use fallback for asset image as asset type */
  get assetOrAssetType(): IBrandedEntity | null {
    if (this.asset) {
      if (this.asset.imageUrl) {
        console.log("default");
        return this.asset;
      } else if ((this.asset as any).assetType) {
        console.log("choose asset type");
        return (this.asset as any).assetType;
      }
    }
    console.log("fallthrough");
    return this.asset;
  }

  // Compute style of logo.
  get logoStyle(): IStyle {
    return {
      height: "80px",
      width: "80px",
      padding: "5px"
    };
  }

  // Handle asset clicked.
  onAssetClicked() {
    this.$emit("assetOpened", this.asset);
  }
}
</script>
