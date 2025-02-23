<script setup lang="ts">
import { ref } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap.less'

const visible = ref(false)
const destroy = ref(false)

function handleDestroy() {
  destroy.value = true
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  visible.value = !target.value
}
</script>

<template>
  <div v-if="!destroy">
    <div :style="{ marginTop: '100px', marginLeft: '100px', marginBottom: '100px' }">
      <Tooltip
        :visible="visible"
        :motion="{ name: 'vc-tooltip-zoom' }"
        :trigger="[]"
        :overlay-style="{ zIndex: 1000 }"
        overlay="required!"
      >
        <input @input="handleChange">
      </Tooltip>
    </div>
    <button type="button" @click="handleDestroy">
      destroy
    </button>
  </div>
</template>
