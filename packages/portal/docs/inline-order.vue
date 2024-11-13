<script setup lang="ts">
import Portal from '@v-c/portal'
import { defineComponent, h, onMounted, shallowRef, version } from 'vue'
import './basic.less'

const Child = defineComponent(() => {
  const divRef = shallowRef()

  onMounted(() => {
    const path: Element[] = []
    if (divRef.value) {
      for (let cur = divRef.value; cur; cur = cur.parentElement) {
        path.push(cur)
      }
    }
    console.log('Path:', path)
  })

  return () => {
    return h('pre', {
      ref: divRef,
      style: {
        border: '1px solid red',
      },
    }, {
      default: () => h('p', [
        `Hello Child ${version}`,
      ]),
    })
  }
})

const show1 = shallowRef(false)
const show2 = shallowRef(false)
</script>

<template>
  <div>
    <button @click="show1 = !show1">
      Trigger Inner Child
    </button>
    <button @click="show2 = !show2">
      Trigger Outer Child
    </button>

    <Portal :open="true">
      <div style="border: 1px solid red;">
        <p>Hello Root {{ version }}</p>

        <Portal v-if="show1" :open="true">
          <Child />
        </Portal>
      </div>
    </Portal>

    <Portal v-if="show2" :open="true">
      <Child />
    </Portal>
  </div>
</template>

<style scoped>

</style>
