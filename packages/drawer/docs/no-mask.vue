<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(true)

function onSwitch() {
  open.value = !open.value
}
</script>

<template>
  <div>
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
      内容区块
      <button
        style="
          height: 24px;
          width: 100px;
          margin-left: 20px;
          color: #000;
          line-height: 24px;
        "
        @click="onSwitch"
      >
        {{ !open ? '打开' : '关闭' }}
      </button>
    </div>

    <Drawer
      width="250px"
      :mask="false"
      :open="open"
      placement="right"
      v-bind="motionProps"
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
