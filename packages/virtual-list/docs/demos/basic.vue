<script setup lang="ts">
import { shallowRef } from 'vue'
import List from '../../src/List'
import type { ListRef } from '../../src'

const listRef = shallowRef<ListRef>()
const visible = shallowRef(true)
interface Item {
  id: number
}

const data = shallowRef<Item[]>([])
for (let i = 0; i < 100; i += 1) {
  data.value.push({
    id: i,
  })
}

function onScroll(e: HTMLDivElement) {
  console.log('scroll:', e.scrollTop)
}

const destrory = shallowRef(false)
const type = shallowRef('dom')
</script>

<template>
  <List
    v-if="!destrory"
    ref="listRef"
    :data="data"
    :height="200" :item-height="20" item-key="id"
    style="border: 1px solid red;box-sizing: border-box;" :style="{ display: visible ? null : 'none' }"
    @scroll="onScroll"
  >
    <template #default="{ item, props }">
      <template v-if="type === 'dom'">
        <span v-bind="props" class="fixed-item" :style="{ height: `${30 + (item.id % 2 ? 0 : 10)}px` }" @click="() => console.log('click:', item.id)">
          {{ item.id }}
        </span>
      </template>
      <template v-else>
        <div v-bind="props" style="line-height: 30px">
          {{ item.id }}
        </div>
      </template>
    </template>
  </List>
</template>

<style scoped>

</style>
