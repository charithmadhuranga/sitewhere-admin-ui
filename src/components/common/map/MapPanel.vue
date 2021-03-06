<template>
  <div class="flex-rows">
    <div v-if="visible" class="map-content">
      <v-map :zoom="zoom" :center="center" style="z-index: 1;" ref="map" />
    </div>
    <loading-overlay v-if="!mapReady" loadingMessage="Loading map..." />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Ref } from "vue-property-decorator";
import Vue from "vue";

import { LoadingOverlay } from "sitewhere-ide-components";

import { Map as LeafletMap, Layer, TileLayer } from "leaflet";

@Component({ components: { LoadingOverlay } })
export default class MapPanel extends Vue {
  @Prop({ default: false }) readonly visible!: boolean;
  @Prop({
    default: function() {
      return [47.41322, -1.219482];
    }
  })
  readonly center!: number[];
  @Prop({ default: 13 }) readonly zoom!: number;
  @Ref() readonly map!: any;

  mapReady = false;

  @Watch("visible", { immediate: true })
  async onVisibilityUpdated(visible: boolean) {
    if (visible) {
      while (this.getMap() == null) {
        await this.sleep(100);
      }
      this.resetMap();
    }
  }

  /** Sleep asynchronously */
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Access the Leaflet map directly */
  getMap(): LeafletMap | null {
    return this.map ? this.map.mapObject : null;
  }

  /** Reset map */
  resetMap() {
    const map: LeafletMap | null = this.getMap();
    if (map) {
      // Remove layers.
      map.eachLayer(function(layer: Layer) {
        if (map) {
          map.removeLayer(layer);
        }
      });

      // Add tile layer for open street map.
      const osmUrl = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
      const osm = new TileLayer(osmUrl, {
        maxZoom: 20
      });
      osm.addTo(map);
      map.invalidateSize();
      this.mapReady = true;
      this.$emit("ready");
    }
  }
}
</script>

<style scoped>
.flex-rows {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.map-content {
  flex: 1;
  overflow-y: hidden;
}
</style>
