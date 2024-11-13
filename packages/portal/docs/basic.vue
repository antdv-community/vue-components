<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import Portal from '../src'
import './basic.less'

const show = ref(true)
const customizeContainer = ref(false)
const lock = ref(true)
const divRef = ref<HTMLDivElement | null>(null)

const version = ref('3.2.0') // Replace with actual version if needed

onUnmounted(() => {
  console.log('Demo unmount!!')
})

const getContainer = computed(() => (customizeContainer.value ? () => divRef.value : undefined))
const contentCls = computed(() => (customizeContainer.value ? '' : 'abs'))

function toggleShow() {
  show.value = !show.value
}

function toggleCustomizeContainer() {
  customizeContainer.value = !customizeContainer.value
}

function toggleLock() {
  lock.value = !lock.value
}
</script>

<template>
  <div style="height: 200vh;">
    <div style="border: 2px solid red;">
      Real Version: {{ version }}
      <button @click="toggleShow">
        show: {{ show.toString() }}
      </button>
      <button @click="toggleCustomizeContainer">
        customize container: {{ customizeContainer.toString() }}
      </button>
      <button @click="toggleLock">
        lock scroll: {{ lock.toString() }}
      </button>
      <div
        id="customize"
        ref="divRef"
        style="border: 1px solid green; min-height: 10px;"
      />
    </div>

    <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
      <p class="root" :class="[contentCls]">
        Hello Root
      </p>
      <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
        <p class="parent" :class="[contentCls]">
          Hello Parent
        </p>
        <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
          <p class="children" :class="[contentCls]">
            Hello Children
          </p>
        </Portal>
      </Portal>
    </Portal>
  </div>
</template>

<style scoped>
</style>
