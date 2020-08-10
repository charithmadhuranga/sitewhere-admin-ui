import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

import { handleError } from "sitewhere-ide-common";
import { AxiosPromise, AxiosResponse } from "axios";
import { IBrandedEntity } from "sitewhere-rest-api";

/**
 * Base class for multiple filter chip components.
 */
@Component
export class MultifilterChipComponent<T extends IBrandedEntity> extends Vue {
  @Prop() readonly tokens!: string[];
  @Prop() readonly tooltip!: string;

  record: T | null = null;

  @Watch("tokens", { immediate: true })
  onSelectionUpdated() {
    this.refresh();
  }

  /** Return method to load record */
  load(): AxiosPromise<T> | T {
    throw new Error("Must implement load() method.");
  }

  /** Type guard to differentiate between responses */
  isAxiosResponse(
    response: AxiosResponse<T> | T
  ): response is AxiosResponse<T> {
    return (response as AxiosResponse<T>).data !== undefined;
  }

  /** Refresh record content based on token */
  async refresh() {
    try {
      if (this.token) {
        const response: AxiosResponse<T> | T = await this.load();
        this.record = this.isAxiosResponse(response) ? response.data : response;
      } else {
        this.record = null;
      }
    } catch (err) {
      handleError(err);
    }
  }

  /** Token which will be displayed */
  get token(): string | null {
    return this.tokens && this.tokens.length > 0 ? this.tokens[0] : null;
  }

  /** Get image information */
  get image() {
    return this.record ? this.record.imageUrl : null;
  }

  /** Get label information */
  get label() {
    if (this.record) {
      const name = (this.record as any).name;
      if (this.tokens.length === 1) {
        return name;
      } else if (this.tokens.length > 1) {
        return `${name} and ${this.tokens.length - 1} more`;
      }
    }
    return null;
  }

  /** Called when close button is clicked */
  onFilterClosed() {
    this.$emit("closed", this.tokens);
  }
}
