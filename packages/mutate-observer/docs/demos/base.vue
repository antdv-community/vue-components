<script setup lang="ts">
import { ref } from 'vue'
import MutationObserver from '../../src'

const internalRef = ref()

function onMutate(mutations: MutationRecord[], observer: MutationObserver) {
  console.log(mutations)
  console.log(observer)
  console.log(internalRef)
}

const flag = ref(true)
</script>

<template>
  <div>
    <MutationObserver @mutate="onMutate">
      <button ref="internalRef" :class="[flag ? 'aaa' : 'bbb']" @click="flag = !flag">
        click
      </button>
    </MutationObserver>
  </div>
</template>
