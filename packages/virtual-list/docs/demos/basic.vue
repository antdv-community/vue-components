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
for (let i = 0; i < 1000; i += 1) {
  data.value.push({
    id: i,
  })
}

function onScroll(e: any) {
  console.log('scroll:', e.target.scrollTop)
}

const destrory = shallowRef(false)
const type = shallowRef('dom')
function showScrollBar() {
  listRef.value?.scrollTo(null)
}

function scrollToTop() {
  listRef.value?.scrollTo(500)
}

function scrollToIndex() {
  listRef.value?.scrollTo({
    index: 99999999,
    align: 'top',
  })
}
</script>

<template>
  <div>
    <button @click="showScrollBar">
      Show Scroll Bar
    </button>
    <button @click="scrollToTop">
      Scroll To 100px
    </button>
    <button @click="scrollToIndex">
      Scroll To Index 99999999 (top)
    </button>
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
          <span v-bind="props" class="fixed-item" :style="{ height: `${30 + (item.id % 2 ? 0 : 10)}px`, ...props.style ?? {} }" @click="() => console.log('click:', item.id)">
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
  </div>
</template>

<style scoped>
.fixed-item{
  border: 1px solid gray;
  padding: 0 16px;
  height: 32px;
  line-height: 30px;
  box-sizing: border-box;
  display: inline-block;
}
</style>
