<template>
  <dialog-form>
    <v-flex xs12>
      <map-with-zone-overlay-panel
        style="height: 400px; border: 1px solid #ddd;"
        ref="map"
        :areaToken="areaToken"
        :visible="mapVisible"
        :zoomToZones="false"
        :ignoreZoneTokens="ignoredZones"
        @ready="onInitializeMap"
      />
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12 class="mb-2">
            <v-text-field
              required
              label="Token"
              v-model="token"
              placeholder=" "
              hide-details
              prepend-icon="info"
            />
            <div class="verror">
              <span v-if="!$v.token.required && $v.$dirty">Token is required.</span>
              <span v-if="!$v.token.validToken && $v.$dirty">Token is not valid.</span>
            </div>
          </v-flex>
          <v-flex xs8>
            <v-text-field
              required
              hide-details
              label="Zone name"
              v-model="name"
              placeholder=" "
              prepend-icon="info"
            />
            <div class="verror">
              <span v-if="$v.name.$invalid && $v.$dirty">Zone name is required.</span>
            </div>
          </v-flex>
          <v-flex xs2>
            <color-picker
              text="Border"
              v-model="borderColor"
              :opacity="borderOpacity"
              @opacityChanged="onBorderOpacityUpdated"
            />
          </v-flex>
          <v-flex xs2>
            <color-picker
              text="Fill"
              v-model="fillColor"
              :opacity="fillOpacity"
              @opacityChanged="onFillOpacityUpdated"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </dialog-form>
</template>

<script lang="ts">
import { Component, Prop, Watch, Ref } from "vue-property-decorator";

import {
  DialogSection,
  DialogForm,
  ColorPicker
} from "sitewhere-ide-components";

import MapWithZoneOverlayPanel from "../common/map/MapWithZoneOverlayPanel.vue";
import {
  swToLeafletBounds,
  leafletToSwBounds,
  enableMapDrawing,
  enableMapEditing
} from "../common/map/MapUtils";

import { required, helpers } from "vuelidate/lib/validators";
import { ILocation, IArea, IZoneCreateRequest } from "sitewhere-rest-api";
import {
  LatLng,
  LatLngBounds,
  Polygon,
  Map as LeafletMap,
  Control,
  Draw,
  latLngBounds as GetLatLongBounds
} from "leaflet";
import XXX from "leaflet-draw";

// Validation for token.
const validToken = helpers.regex("validToken", /^[a-zA-Z0-9-_]+$/);

@Component({
  components: {
    DialogSection,
    DialogForm,
    ColorPicker,
    MapWithZoneOverlayPanel
  },
  validations: {
    token: {
      required,
      validToken
    },
    name: {
      required
    },
    borderColor: {
      required
    },
    borderOpacity: {
      required
    },
    fillColor: {
      required
    },
    fillOpacity: {
      required
    }
  }
})
export default class ZoneDetailFields extends DialogSection {
  @Prop() readonly area!: IArea;
  @Prop() readonly mapVisible!: boolean;
  @Ref() readonly map!: MapWithZoneOverlayPanel;

  token: string | null = null;
  name: string | null = null;
  bounds: ILocation[] = [];
  borderColor = "#333";
  borderOpacity = 0.7;
  fillColor = "#ccc";
  fillOpacity = 0.4;
  editControl: Control.Draw | null = null;
  zoneLayer: Polygon | null = null;

  xxx: any = XXX;

  /** Getter for area token */
  get areaToken() {
    return this.area ? this.area.token : null;
  }

  /** Getter for ignored zone tokens */
  get ignoredZones(): string[] {
    return this.token ? [this.token] : [];
  }

  /** Called when map is ready */
  onInitializeMap() {
    const map: LeafletMap | null = this.getMap();

    // Hook up event handlers.
    if (map) {
      map.off(Draw.Event.DRAWSTART).on(Draw.Event.DRAWSTART, () => {
        this.removeZoneLayer();
      });
      map.off(Draw.Event.CREATED).on(Draw.Event.CREATED, e => {
        this.addZoneLayer(e);
      });
      map.off(Draw.Event.EDITED).on(Draw.Event.EDITED, () => {
        this.editZoneLayer();
      });
      map.off(Draw.Event.DELETED).on(Draw.Event.DELETED, () => {
        this.bounds = [];
        this.removeZoneLayer();
      });
    }

    // Zoom and center on area bounds.
    const latLongs: LatLng[] = swToLeafletBounds(this.area.bounds);
    if (map) {
      map.fitBounds(GetLatLongBounds(latLongs), {
        padding: [10, 10]
      });
    }

    // Update map with existing bounds.
    this.onBoundsSet(this.bounds);
  }

  /** Access the Leaflet map directly */
  getMap(): LeafletMap | null {
    return this.map ? this.map.getMap() : null;
  }

  /** Reset section content */
  reset(): void {
    // Refresh zones.
    if (this.map) {
      this.map.refresh();
    }

    // Reset fields.
    this.token = null;
    this.name = null;
    this.bounds = [];
    this.borderColor = "#333";
    this.borderOpacity = 0.7;
    this.fillColor = "#ccc";
    this.fillOpacity = 0.4;
    this.$v.$reset();
  }

  /** Perform validation */
  validate(): boolean {
    if (!this.zoneLayer) {
      return false;
    }

    this.$v.$touch();
    return !this.$v.$invalid;
  }

  /** Load form data from an object */
  load(input: IZoneCreateRequest): void {
    this.token = (input as any).token;
    this.name = (input as any).name;
    this.bounds = (input as any).bounds;
    this.borderColor = (input as any).borderColor;
    this.borderOpacity = (input as any).borderOpacity;
    this.fillColor = (input as any).fillColor;
    this.fillOpacity = (input as any).fillOpacity;
  }

  /** Save form data to an object */
  save(): {} {
    return {
      token: this.token,
      name: this.name,
      bounds: this.bounds,
      borderColor: this.borderColor,
      borderOpacity: this.borderOpacity,
      fillColor: this.fillColor,
      fillOpacity: this.fillOpacity
    };
  }
  /** Called when zone bounds are updated */
  onBoundsUpdated(bounds: ILocation[]) {
    this.bounds = bounds;
  }

  /** Called when border opacity value is updated */
  onBorderOpacityUpdated(opacity: number) {
    this.borderOpacity = opacity;
  }

  /** Called when fill opacity value is updated */
  onFillOpacityUpdated(opacity: number) {
    this.fillOpacity = opacity;
  }

  @Watch("bounds")
  onBoundsSet(updated: ILocation[]) {
    const map: LeafletMap | null = this.getMap();
    if (map) {
      // Remove zone layer if already existing.
      if (this.zoneLayer) {
        this.removeZoneLayer();
      }

      // Create zone polygon layer.
      if (updated && updated.length > 0) {
        const latLongs: LatLng[] = swToLeafletBounds(updated);
        const lBounds: LatLngBounds = GetLatLongBounds(latLongs);
        if (latLongs && latLongs.length > 0) {
          const polygon = new Polygon(latLongs, {
            weight: 3
          });
          this.zoneLayer = polygon;
          this.updateZoneStyle();
          map.addLayer(polygon);
          map.fitBounds(lBounds, {
            padding: [10, 10]
          });
        }
      }

      this.prepareDrawControls(map);
    }
  }

  /** Prepare drawing controls */
  prepareDrawControls(map: LeafletMap) {
    /** Remove edit control */
    const edit = this.editControl;
    if (edit) {
      map.removeControl(edit);
    }

    if (this.zoneLayer) {
      this.editControl = enableMapEditing(map, this.zoneLayer);
    } else {
      const zone: IZoneCreateRequest = {
        areaToken: "",
        name: "",
        bounds: [],
        borderColor: this.borderColor ? this.borderColor : "#666",
        borderOpacity: this.borderOpacity ? this.borderOpacity : 0.7,
        fillColor: this.fillColor ? this.fillColor : "#ccc",
        fillOpacity: this.fillOpacity ? this.fillOpacity : 0.4
      };
      this.editControl = enableMapDrawing(map, zone);
    }
  }

  @Watch("borderColor")
  @Watch("borderOpacity")
  @Watch("fillColor")
  @Watch("fillOpacity")
  onStyleSet() {
    this.updateZoneStyle();
  }

  /** Update style of zone based on selections */
  updateZoneStyle() {
    if (this.zoneLayer) {
      this.zoneLayer.setStyle({
        color: this.borderColor ? this.borderColor : "#666"
      });
      this.zoneLayer.setStyle({
        opacity: this.borderOpacity ? this.borderOpacity : 0.7
      });
      this.zoneLayer.setStyle({
        fillColor: this.fillColor ? this.fillColor : "#ccc"
      });
      this.zoneLayer.setStyle({
        fillOpacity: this.fillOpacity ? this.fillOpacity : 0.4
      });
    }
  }

  /** Add new zone layer */
  addZoneLayer(e: any) {
    const zoneLayer: Polygon = e.layer;
    this.bounds = leafletToSwBounds(zoneLayer.getLatLngs()[0]);
  }

  /** Edit existing zone layer */
  editZoneLayer() {
    if (this.zoneLayer) {
      this.bounds = leafletToSwBounds(this.zoneLayer.getLatLngs()[0]);
    }
  }

  /** Remove existing zone layer */
  removeZoneLayer() {
    const map: LeafletMap | null = this.getMap();
    if (this.zoneLayer && map) {
      map.removeLayer(this.zoneLayer);
      this.zoneLayer = null;
    }
  }
}
</script>
