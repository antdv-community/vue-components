<script setup lang="ts">
import { h } from 'vue'
import Input from '../../src'

const clearIcon = h('span', 'x')
</script>

<template>
  <div>
    <Input placeholder="请输入内容" prefix-cls="vc-input" allow-clear />
    <br>
    <Input placeholder="请输入内容" prefix-cls="vc-input" allow-clear>
      <template #clearIcon>
        <clearIcon />
      </template>
    </Input>
  </div>
</template>
