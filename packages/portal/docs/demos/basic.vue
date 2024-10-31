<script setup lang="ts">
import Portal from '@v-c/portal'
import { computed, onUnmounted, ref } from 'vue'

const show = ref(true)
const customizeContainer = ref(false)
const lock = ref(true)
const divRef = ref<HTMLDivElement>()

const getContainer = computed(() => customizeContainer.value ? divRef.value : undefined)

onUnmounted(() => {
  console.log('Demo unmount!!')
})
</script>

<template>
  <div style="height: 200vh;">
    <div style="border: 2px solid red;">
      <button @click="show = !show">
        show: {{ show }}
      </button>
      <button @click="customizeContainer = !customizeContainer">
        customize container: {{ customizeContainer }}
      </button>
      <button @click="lock = !lock">
        lock scroll: {{ lock }}
      </button>
      <div
        id="customize"
        ref="divRef"
        style="border: 1px solid green; min-height: 10px;"
      />
    </div>

    <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
      <p class="root" :class="[customizeContainer ? '' : 'abs']">
        Hello Root
      </p>
      <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
        <p class="parent" :class="[customizeContainer ? '' : 'abs']">
          Hello Parent
        </p>
        <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
          <p class="children" :class="[customizeContainer ? '' : 'abs']">
            Hello Children
          </p>
        </Portal>
      </Portal>
    </Portal>
  </div>
</template>

<style>
.abs {
  position: absolute;
  z-index: 999999;
  left: 0;
  background: red;
}

.root {
  top: 0;
}

.parent {
  top: 50px;
}

.children {
  top: 100px;
}
</style>
