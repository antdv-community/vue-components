<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'
import GetContainerFalse from './get-container-false.vue'

const containerRef = ref<HTMLDivElement | null>(null)
const open = ref(false)

function setOpen(value: boolean) {
  open.value = value
}
</script>

<template>
  <div>
    <div id="container" ref="containerRef">
      <button @click="() => setOpen(true)">
        Open
      </button>
    </div>
    <Drawer
      width="20vw"
      :get-container="() => containerRef"
      :open="open"
      v-bind="motionProps"
      @close="() => setOpen(false)"
    >
      <div class="content">
        content
      </div>
    </Drawer>
  </div>
  <hr>
  <GetContainerFalse />
</template>

<style scoped>
.content {
  padding: 20px;
}
</style>
