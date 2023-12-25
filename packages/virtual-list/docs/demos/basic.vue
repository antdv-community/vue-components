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

const destroy = shallowRef(false)
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

function handleDestroy() {
  listRef.value?.scrollTo({
    index: 50,
    align: 'top',
  })
  destroy.value = true
}
function handleChange(_type: string) {
  type.value = _type
}
</script>

<template>
  <div>
    <div style="display: flex;flex-wrap: wrap;gap: 5px;margin-bottom: 10px">
      <label>
        <input type="radio" name="type" :checked="type === 'dom'" @change="handleChange('dom')">
        dom
      </label>
      <label>
        <input type="radio" name="type" :checked="type === 'ref'" @change="handleChange('ref')">
        ref
      </label>
      <button class="btn" @click="showScrollBar">
        Show Scroll Bar
      </button>
      <button class="btn" @click="scrollToTop">
        Scroll To 100px
      </button>
      <button class="btn" @click="scrollToIndex">
        Scroll To Index 99999999 (top)
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: 50, align: 'top' })">
        Scroll To 50 (top)
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: 50, align: 'bottom' })">
        Scroll To 50 (bottom)
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: 50, align: 'auto' })">
        Scroll To 50 (auto)
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: 50, align: 'top', offset: 15 })">
        Scroll To 50 (top) + offset 15
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: 50, align: 'bottom', offset: 15 })">
        Scroll To 50 (bottom)
      </button>
      <button class="btn" @click="listRef?.scrollTo({ key: 50, align: 'auto' })">
        Scroll To key 50 (auto)
      </button>
      <button class="btn" @click="visible = !visible">
        visible
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: data.length - 2, align: 'top' })">
        Scroll To Last (top)
      </button>
      <button class="btn" @click="listRef?.scrollTo({ index: 0, align: 'bottom' })">
        Scroll To Last (bottom)
      </button>
      <button class="btn" @click="handleDestroy">
        Scroll To remove
      </button>
    </div>
    <List
      v-if="!destroy"
      v-show="visible"
      ref="listRef"
      :data="data" :height="200" :item-height="20"
      item-key="id"
      style="border: 1px solid red;box-sizing: border-box;"
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
