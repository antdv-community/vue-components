<script setup lang="ts">
import CSSMotion from '@vue-components/motion'
import { shallowRef } from 'vue'

const show = shallowRef(false)
function onTrigger() {
  show.value = !show.value
}

async function forceDelay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000)
  })
}

const prepare = shallowRef(false)
function onCollapse() {
  return { height: 0 }
}

function skipColorTransition(_, event) {
  // CSSMotion support multiple transition.
  // You can return false to prevent motion end when fast transition finished.
  if (event.propertyName === 'background-color')
    return false

  return true
}
</script>

<template>
  <div class="motion-demo-basic">
    <label>
      <input
        type="checkbox" :checked="show"

        @change="onTrigger"
      >
      Show Component
    </label>
    <CSSMotion
      :visible="show"
      motion-name="transition"
      :remove-on-leave="true"
      leaved-class-name="hidden"
      :on-appear-start="onCollapse"
      :on-enter-start="onCollapse"
      :on-leave-active="onCollapse"
      :on-enter-end="skipColorTransition"
      :on-leave-end="skipColorTransition"
      :on-visible-changed="visible => console.log('visible', visible)"
    >
      <template #default="scope">
        <div
          class="demo-block"
          :class="scope?.props?.class"
          :style="scope?.props.style"
        >
          <!--        -->
          {{ scope }}
        </div>
      </template>
    </CSSMotion>
  </div>
</template>

<style lang="less">
  .grid {
    display: table;

    > div {
      display: table-cell;
      min-width: 350px;
    }
  }

  .demo-block {
    display: block;
    width: 300px;
    height: 300px;
    overflow: hidden;
    background: red;
  }

  .transition {
    transition: background 0.3s, height 1.3s, opacity 1.3s;
    // transition: all 5s!important;

    &.transition-appear,
    &.transition-enter {
      opacity: 0;
    }

    &.transition-appear.transition-appear-active,
    &.transition-enter.transition-enter-active {
      opacity: 1;
    }

    &.transition-leave-active {
      background: green;
      opacity: 0;
    }
  }

  .animation {
    animation-duration: 1.3s;
    animation-fill-mode: both;

    &.animation-appear,
    &.animation-enter {
      animation-name: enter;
      animation-play-state: paused;
      animation-fill-mode: both;
    }

    &.animation-appear.animation-appear-active,
    &.animation-enter.animation-enter-active {
      animation-name: enter;
      animation-play-state: running;
    }

    &.animation-leave {
      animation-name: leave;
      animation-play-state: paused;
      animation-fill-mode: both;

      &.animation-leave-active {
        animation-name: leave;
        animation-play-state: running;
      }
    }
  }

  .hidden {
    display: none !important;
  }

  @keyframes enter {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes leave {
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(0);
      opacity: 0;
    }
  }
</style>
