<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(false)

function setOpen(value: boolean) {
  open.value = value
}
</script>

<template>
  <div style="position: relative">
    <div
      style="
        height: 300px;
        background: rgba(0, 0, 0, 0.05);
        overflow: auto;
        position: relative;
      "
    >
      <div
        style="
          display: inline-block;
          height: 1000px;
          box-shadow: 0 0 1px red;
        "
      >
        <button
          style="height: 100px"
          @click="() => setOpen(true)"
        >
          Open
        </button>
      </div>
    </div>

    <Drawer
      width="20vw"
      :get-container="false"
      placement="right"
      :open="open"
      v-bind="motionProps"
      @close="() => setOpen(false)"
    >
      <div class="content">
        Content Area
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.content {
  padding: 20px;
}
</style>
