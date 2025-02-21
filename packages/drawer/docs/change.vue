<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const open = ref(true)

onMounted(() => {
  setTimeout(() => {
    open.value = false
  }, 2000)
})

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
      width="20vw"
      v-bind="motionProps"
      @close="onTouchEnd"
      @after-open-change="(c: boolean) => {
        console.log('transitionEnd: ', c)
      }"
    >
      <div class="content">
        content
      </div>
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
  </div>
</template>

<style scoped>
.content {
  padding: 20px;
}
</style>
