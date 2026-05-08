<template>
  <view class="custom-icon" :style="iconStyle" @click="$emit('click')"></view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    default: '/static/icons/'
  },
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: ''
  }
})

const iconStyle = computed(() => {
  const size = typeof props.size === 'number' ? props.size + 'px' : props.size
  const style = {
    width: size,
    height: size
  }

  // If color is provided, use mask-image to tint the SVG
  if (props.color) {
    const iconUrl = `${props.path}${props.name}.svg`
    style.backgroundColor = props.color
    style.webkitMaskImage = `url(${iconUrl})`
    style.maskImage = `url(${iconUrl})`
    style.webkitMaskRepeat = 'no-repeat'
    style.maskRepeat = 'no-repeat'
    style.webkitMaskPosition = 'center'
    style.maskPosition = 'center'
    style.webkitMaskSize = 'contain'
    style.maskSize = 'contain'
  } else {
    // If no color, use background-image (original SVG color)
    const iconUrl = `${props.path}${props.name}.svg`
    style.backgroundImage = `url(${iconUrl})`
    style.backgroundSize = 'contain'
    style.backgroundRepeat = 'no-repeat'
    style.backgroundPosition = 'center'
  }

  return style
})
</script>

<style scoped>
.custom-icon {
  display: block;
  flex-shrink: 0;
  /* Let parent handle clicks */
  pointer-events: none;
}
</style>
