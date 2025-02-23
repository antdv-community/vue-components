<script setup lang="ts">
import { ref } from 'vue'
import type { CSSProperties } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap_white.less'

const text = 'Tooltip Text'
const scrollRef = ref<HTMLDivElement>()

const containerStyle: CSSProperties = {
  padding: '10px',
}

const scrollContainerStyle: CSSProperties = {
  border: '1px solid black',
  width: '100%',
  height: 'calc(100vh - 40px)',
  boxSizing: 'border-box',
  overflow: 'auto',
}

const contentStyle: CSSProperties = {
  background: 'rgba(255,0,0,0.05)',
  width: '300%',
  height: '200%',
  position: 'relative',
}

const hoverBoxStyle: CSSProperties = {
  background: 'rgba(0,255,0,0.3)',
  width: '100px',
  height: '50px',
  position: 'absolute',
  left: '30%',
  top: '30%',
}
</script>

<template>
  <div :style="containerStyle">
    <div ref="scrollRef" :style="scrollContainerStyle">
      <div :style="contentStyle">
        <Tooltip
          placement="top"
          :overlay="text"
          :overlay-inner-style="{ width: '300px', height: '50px' }"
          popup-visible
        >
          <div :style="hoverBoxStyle">Hover Me</div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>