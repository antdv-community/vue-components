<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap_white.less'

const text = 'Tooltip Text'

const styles: CSSProperties = {
  display: 'table-cell',
  height: '60px',
  width: '80px',
  textAlign: 'center',
  background: '#f6f6f6',
  verticalAlign: 'middle',
  border: '5px solid white',
}

const rowStyle: CSSProperties = {
  display: 'table-row',
}
</script>

<template>
  <div :style="{ display: 'table', padding: '120px' }">
    <div :style="rowStyle">
      <Tooltip placement="left">
        <a href="#" :style="styles">Left</a>
        <template #overlay>
          <span>{{ text }}</span>
        </template>
      </Tooltip>
      <Tooltip placement="top" :overlay="text">
        <a href="#" :style="styles">Top</a>
      </Tooltip>
      <Tooltip placement="bottom" :overlay="text">
        <a href="#" :style="styles">Bottom</a>
      </Tooltip>
      <Tooltip placement="right" :overlay="text">
        <a href="#" :style="styles">Right</a>
      </Tooltip>
    </div>
    <div :style="rowStyle">
      <Tooltip placement="leftTop" :overlay="text">
        <a href="#" :style="styles">Left Top</a>
      </Tooltip>
      <Tooltip placement="leftBottom" :overlay="text">
        <a href="#" :style="styles">Left Bottom</a>
      </Tooltip>
      <Tooltip placement="rightTop" :overlay="text">
        <a href="#" :style="styles">Right Top</a>
      </Tooltip>
      <Tooltip placement="rightBottom" :overlay="text">
        <a href="#" :style="styles">Right Bottom</a>
      </Tooltip>
    </div>
    <div :style="rowStyle">
      <Tooltip placement="topLeft" :overlay="text">
        <a href="#" :style="styles">Top Left</a>
      </Tooltip>
      <Tooltip placement="topRight" :overlay="text">
        <a href="#" :style="styles">Top Right</a>
      </Tooltip>
      <Tooltip placement="bottomLeft" :overlay="text">
        <a href="#" :style="styles">Bottom Left</a>
      </Tooltip>
      <Tooltip placement="bottomRight" :overlay="text">
        <a href="#" :style="styles">Bottom Right</a>
      </Tooltip>
    </div>
  </div>
</template>
