<script setup lang="ts">
import { Checkbox } from '@vue-components/checkbox'
import { shallowRef } from 'vue'

const value = shallowRef()
</script>

<template>
  <Checkbox v-model:checked="value" />
  {{ value }}
</template>

<style scoped>

</style>
