<template>
  <dialog-form>
    <v-flex xs9>
      <form-text
        required
        label="Hostname"
        title="Base hostname for computing Sentinel servers."
        v-model="hostname"
        icon="fa-cog"
        class="mr-3"
      ></form-text>
    </v-flex>
    <v-flex xs3>
      <form-text
        required
        label="Port"
        title="Sentinel server port."
        v-model="port"
        icon="fa-cog"
        type="number"
      ></form-text>
    </v-flex>
    <v-flex xs6>
      <form-text
        required
        label="Node Count"
        title="Number of nodes to list for Sentinel."
        v-model="nodeCount"
        icon="fa-cog"
        type="number"
        class="mr-3"
      ></form-text>
    </v-flex>
    <v-flex xs6>
      <form-text
        required
        label="Master Group Name"
        title="Mater group name for Redis client connection."
        v-model="masterGroupName"
        icon="fa-cog"
      ></form-text>
    </v-flex>
  </dialog-form>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import { DialogSection, DialogForm, FormText } from "sitewhere-ide-components";

import { IRedisConfiguration } from "sitewhere-rest-api";

@Component({
  components: { DialogForm, FormText },
  validations: {}
})
export default class KafkaConfigurationFields extends DialogSection {
  hostname: string | null = null;
  port: number | null = null;
  nodeCount: number | null = null;
  masterGroupName: string | null = null;

  /** Reset section content */
  reset(): void {
    this.hostname = null;
    this.port = null;
    this.nodeCount = null;
    this.masterGroupName = null;
    this.$v.$reset();
  }

  /** Perform validation */
  validate(): boolean {
    this.$v.$touch();
    return !this.$v.$invalid;
  }

  /** Load form data from an object */
  load(redis: IRedisConfiguration): void {
    this.hostname = redis.hostname;
    this.port = redis.port;
    this.nodeCount = redis.nodeCount;
    this.masterGroupName = redis.masterGroupName;
  }

  /** Save form data to an object */
  save(): {} {
    return {
      hostname: this.hostname,
      port: this.port,
      nodeCount: this.nodeCount,
      masterGroupName: this.masterGroupName
    };
  }
}
</script>
