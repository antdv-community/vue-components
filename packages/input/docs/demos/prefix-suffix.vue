<script setup lang="ts">
import Input from '../../index'
</script>

<template>
  <div>
    <Input placeholder="请输入内容" prefix-cls="vc-input">
      <template #prefix>
        prefix
      </template>
    </Input>
    <br>
    <Input placeholder="请输入内容" prefix-cls="vc-input">
      <template #suffix>
        suffix
      </template>
    </Input>
  </div>
</template>
