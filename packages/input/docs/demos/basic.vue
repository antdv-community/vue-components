<script setup lang="ts">
import Input from '../../src'
</script>

<template>
  <div>
    <Input placeholder="请输入内容" prefix-cls="vc-input" />
  </div>
</template>

<style>
.vc-input-out-of-range {
  color: red;
}

.vc-input-affix-wrapper {
  padding: 2px 8px;
  overflow: hidden;
  border: 1px solid lightgray;
  border-radius: 2px;
}

.vc-input-affix-wrapper:hover,
.vc-input-affix-wrapper:focus-within {
  border-color: #000;
}

.vc-input-affix-wrapper input {
  padding: 0;
  border: none;
  outline: none;
}

.vc-input-clear-icon {
  font-size: 12px;
  cursor: pointer;
}

.vc-input-clear-icon-hidden {
  display: none;
}
</style>
