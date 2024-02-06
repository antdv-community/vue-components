<script setup lang="ts">
import Input from '../../src'
</script>

<template>
  <div>
    <Input placeholder="请输入内容" prefix-cls="vc-input">
      <template #addonBefore>
        http://
      </template>
    </Input>
    <br>
    <Input placeholder="请输入内容" prefix-cls="vc-input">
      <template #addonAfter>
        MB
      </template>
    </Input>
  </div>
</template>
