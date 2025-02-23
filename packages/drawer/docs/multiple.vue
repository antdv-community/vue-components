<script setup lang="ts">
import { ref } from 'vue'
import Drawer from '../src'
import motionProps from './assets/motion'
import './assets/index.less'

const open = ref(true)
const openChild = ref(true)
const openChildren = ref(true)

function onClick() {
  open.value = !open.value
}

function onChildClick() {
  openChild.value = !openChild.value
}

function onChildrenClick(e: Event) {
  openChildren.value = e.currentTarget instanceof HTMLButtonElement
}
</script>

<template>
  <div>
    <div
      style="
        width: 100%;
        height: 667px;
        background: #fff000;
        color: #fff;
        text-align: center;
        line-height: 667px;
      "
    >
      <button @click="onClick">
        打开抽屉
      </button>
    </div>
    <Drawer
      width="20vw"
      :open="open"
      class="drawer1"
      placement="right"
      :push="{ distance: 64 }"
      root-class-name="level-0"
      v-bind="motionProps"
      @close="onClick"
    >
      <div>
        <button @click="onChildClick">
          打开子级
        </button>
        <Drawer
          :open="openChild"
          class="drawer2"
          placement="right"
          root-class-name="level-1"
          v-bind="motionProps"
          @close="onChildClick"
        >
          <div style="width: 200px">
            二级抽屉
            <button @click="onChildrenClick">
              打开子子级
            </button>
            <Drawer
              :open="openChildren"
              placement="right"
              root-class-name="level-2"
              v-bind="motionProps"
              @close="onChildrenClick"
            >
              <div style="width: 200px">
                三级抽屉
              </div>
            </Drawer>
          </div>
        </Drawer>
      </div>
    </Drawer>
  </div>
</template>
