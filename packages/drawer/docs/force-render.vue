<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(false)
const open2 = ref(false)

function setOpen(value: boolean) {
  open.value = value
}

function setOpen2(value: boolean) {
  open2.value = value
}
</script>

<template>
  <div>
    <Drawer
      width="20vw"
      :open="open"
      force-render
      v-bind="motionProps"
      @close="() => setOpen(false)"
    >
      <input>
      <input>
      <input>
    </Drawer>
    <Drawer
      width="20vw"
      :open="open2"
      destroy-on-close
      placement="left"
      v-bind="motionProps"
      @close="() => setOpen2(false)"
    >
      Hello World!
    </Drawer>
    <div
      style="
        width: 100%;
        height: 667px;
        background: #fff000;
        color: #fff;
        text-align: center;
        line-height: 667px;
      "
    >
      <button @click="() => setOpen(true)">
        Force Render
      </button>
      <button @click="() => setOpen2(true)">
        Destroy On Close
      </button>
    </div>
  </div>
</template>
