<script setup lang="ts">
import { ref } from 'vue'
import Switch from '../src'
import './assets/index.less'

const disabled = ref(false)
const checked = ref(false)

function onChange(value: boolean, event: Event) {
  // Log the switch status and event
  console.log(`switch checked: ${value}`, event)
  checked.value = value
}

function toggle() {
  disabled.value = !disabled.value
}
</script>

<template>
  <div style="margin: 20px;">
    <Switch
      :checked="checked"
      :disabled="disabled"
      checked-children="开"
      un-checked-children="关"
      @change="onChange"
    />
    <div style="margin-top: 20px;">
      <button @click="toggle">
        toggle disabled
      </button>
    </div>
  </div>
</template>
