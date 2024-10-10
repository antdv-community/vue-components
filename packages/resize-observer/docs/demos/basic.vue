<script setup lang="ts">
import ResizeObserver from '@v-c/resize-observer'

function onResize(entry: any) {
  console.log(entry)
}
</script>

<template>
  <div>
    <ResizeObserver :on-resize="onResize">
      <div>
        测试
      </div>
    </ResizeObserver>
  </div>
</template>

<style scoped>

</style>
