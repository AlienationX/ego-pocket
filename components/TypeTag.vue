<template>
  <view class="type-tag" :class="[typeName.toLowerCase(), size]" @click.stop="$emit('click', typeName)">
    <image v-if="showIcon" class="type-icon" :src="iconPath" mode="aspectFit" />
    <text class="type-text">{{ typeZh || typeName }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  typeName: {
    type: String,
    required: true
  },
  typeZh: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

defineEmits(['click'])

const iconPath = computed(() => {
  // Map internal name to SVG filename (Capitalized)
  const name = props.typeName.charAt(0).toUpperCase() + props.typeName.slice(1).toLowerCase()
  return `/static/types/${name}.svg`
})
</script>

<style lang="scss" scoped>
.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.95);
  }
  
  &.active {
    outline: 3px solid rgba(0,0,0,0.15);
    outline-offset: -3px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transform: translateY(-2px);
  }

  &.small {
    padding: 2px 6px;
    gap: 2px;
    .type-icon { width: 12px; height: 12px; }
    .type-text { font-size: 10px; }
  }

  &.medium {
    padding: 4px 12px;
    .type-icon { width: 14px; height: 14px; }
    .type-text { font-size: 12px; }
  }

  &.large {
    padding: 6px 16px;
    .type-icon { width: 18px; height: 18px; }
    .type-text { font-size: 14px; }
  }
}

.type-icon {
  // Icons are SVGs, usually white or colored
}

.type-text {
  font-weight: 800;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

// Type Colors
.normal { background-color: #A8A77A; }
.fire { background-color: #EE8130; }
.water { background-color: #6390F0; }
.electric { background-color: #F7D02C; }
.grass { background-color: #7AC74C; }
.ice { background-color: #96D9D6; }
.fighting { background-color: #C22E28; }
.poison { background-color: #A33EA1; }
.ground { background-color: #E2BF65; }
.flying { background-color: #A98FF3; }
.psychic { background-color: #F95587; }
.bug { background-color: #A6B91A; }
.rock { background-color: #B6A136; }
.ghost { background-color: #735797; }
.dragon { background-color: #6F35FC; }
.dark { background-color: #705746; }
.steel { background-color: #B7B7CE; }
.fairy { background-color: #D685AD; }
</style>
