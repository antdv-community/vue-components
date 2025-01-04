<script setup>
import BodyOverflow from "./bodyOverflow.vue";
import Simple from './simple.vue'
</script>

<template>
  <Story title="Trigger">
    <Variant title="body-overflow">
      <BodyOverflow />
    </Variant>
    <Variant title="simple">
      <Simple />
    </Variant>
  </Story>
</template>
