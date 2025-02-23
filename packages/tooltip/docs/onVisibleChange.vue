<script setup lang="ts">
import { ref } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap.less'

const visible = ref(false)
const destroy = ref(false)

function preventDefault(e: Event) {
  e.preventDefault()
}

function onVisibleChange(isVisible: boolean) {
  visible.value = isVisible
}

function onDestroy() {
  destroy.value = true
}
</script>

<template>
  <div v-if="!destroy">
    <div style="margin-top: 300px; margin-left: 100px; margin-bottom: 100px">
      <Tooltip
        :visible="visible"
        :motion="{ name: 'vc-tooltip-zoom' }"
        trigger="click"
        @visible-change="onVisibleChange"
      >
        <a href="#" @click="preventDefault">trigger</a>
        <template #overlay>
          <span>I am a tooltip</span>
        </template>
      </Tooltip>
    </div>
    <button type="button" @click="onDestroy">
      destroy
    </button>
  </div>
</template>
