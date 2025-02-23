<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(false)

function onTouchEnd() {
  open.value = false
}

function onSwitch() {
  open.value = !open.value
}
</script>

<template>
  <div>
    <Drawer
      :open="open"
      placement="right"
      width="60%"
      v-bind="motionProps"
      @close="onTouchEnd"
      @after-open-change="(c: boolean) => {
        console.log('transitionEnd: ', c)
      }"
      @mouseenter="() => {
        console.log('mouseEnter')
      }"
      @mouseleave="() => {
        console.log('mouseLeave')
      }"
    >
      content
    </Drawer>
    <div>
      <button @click="onSwitch">
        打开
      </button>
    </div>
  </div>
</template>
