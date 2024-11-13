<script setup lang="ts">
import Portal from '@v-c/portal'
import { defineComponent, onMounted, shallowRef } from 'vue'

const Content = defineComponent(() => {
  onMounted(() => {
    console.log('mounted')
  })
  return () => 'Bamboo'
})

const divRef = shallowRef()
function getContainer() {
  return divRef.value
}
</script>

<template>
  <div ref="divRef" class="holder" style="min-height: 10px;border: 1px solid blue;">
    <Portal open :get-container="getContainer">
      <Content />
    </Portal>
  </div>
</template>

<style scoped>

</style>
