<script setup lang="ts">
import Basic from './basic.vue'
import GetContainer from './get-container.vue'
import InlineOrder from './inline-order.vue'
</script>

<template>
  <Story title="Portal">
    <Variant title="Basic">
      <!--      测试 -->
      <Basic />
    </Variant>

    <Variant title="GetContainer">
      <GetContainer />
    </Variant>

    <Variant title="InlineOrder">
      <InlineOrder />
    </Variant>
  </Story>
</template>
