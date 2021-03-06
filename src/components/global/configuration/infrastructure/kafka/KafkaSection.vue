<template>
  <content-section icon="fa-cogs" title="Apache Kafka Configuration">
    <template slot="overlay">
      <div class="logo" />
    </template>
    <v-card v-if="kafka" flat>
      <content-field name="hostname" :value="kafka.hostname" />
      <content-field :alt="true" name="port" :value="kafka.port" />
      <content-field name="default topic partitions" :value="kafka.defaultTopicPartitions" />
      <content-field
        :alt="true"
        name="default topic relication factor"
        :value="kafka.defaultTopicReplicationFactor"
      />
      <content-link
        class="mt-3"
        icon="fa-edit"
        text="Edit Kafka configuration."
        @linkClicked="onEdit"
      />
    </v-card>
    <kafka-configuration-dialog ref="dialog" :kafka="kafka" @payload="onKafkaUpdated" />
  </content-section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Ref } from "vue-property-decorator";

import KafkaConfigurationDialog from "./KafkaConfigurationDialog.vue";

import {
  ContentSection,
  ContentField,
  ContentLink
} from "sitewhere-ide-components";

import {
  IInstanceConfiguration,
  IInfrastructureConfiguration,
  IKafkaConfiguration
} from "sitewhere-rest-api";

@Component({
  components: {
    ContentSection,
    ContentField,
    ContentLink,
    KafkaConfigurationDialog
  }
})
export default class KafkaSection extends Vue {
  @Prop() readonly configuration!: IInstanceConfiguration;
  @Ref() readonly dialog!: KafkaConfigurationDialog;

  /** Get infrastructure information */
  get infrastructure(): IInfrastructureConfiguration | null {
    return this.configuration ? this.configuration.infrastructure : null;
  }

  /** Get Kafka configuration */
  get kafka(): IKafkaConfiguration | null {
    return this.infrastructure ? this.infrastructure.kafka : null;
  }

  /** Called to edit Kafka configuration */
  onEdit(): void {
    if (this.kafka) {
      this.dialog.load(this.kafka);
      this.dialog.openDialog();
    }
  }

  /** Called after Kafka values are updated */
  onKafkaUpdated(updated: IKafkaConfiguration): void {
    this.$emit("updated", updated);
  }
}
</script>

<style scoped>
.logo {
  position: absolute;
  top: 10px;
  right: 100px;
  width: 150px;
  height: 150px;
  background-image: url("../../../../../assets/kafka.png");
  background-size: contain;
  opacity: 0.8;
}
</style>
