<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'

const show = ref(true)

onMounted(() => {
  setTimeout(() => {
    show.value = false
  }, 2000)
})
</script>

<template>
  <div>
    <Drawer
      v-if="show"
      root-class-name="drawer-wrapper"
      width="20vw"
      :open="true"
      v-bind="motionProps"
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
    </div>
  </div>
</template>

<style scoped>
.content {
  padding: 20px;
}
</style>
