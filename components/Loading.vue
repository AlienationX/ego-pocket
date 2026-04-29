<template>
  <view class="loading-overlay" v-if="show" :class="[size, { 'fullscreen': fullscreen }]" @touchmove.stop.prevent>
    <view class="loader-content">
      <view class="pokeball-loader">
        <view class="pokeball-top"></view>
        <view class="pokeball-bottom"></view>
        <view class="pokeball-center"></view>
      </view>
      <text class="loading-text" v-if="text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: 'Loading...'
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  }
})
</script>

<style lang="scss" scoped>
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.6);
  }
  
  &:not(.fullscreen) {
    padding: 20px 0;
    width: 100%;
  }

  &.small {
    .pokeball-loader {
      width: 30px;
      height: 30px;
      border-width: 2px;
    }
    .pokeball-top { border-bottom-width: 1px; }
    .pokeball-center {
      width: 8px;
      height: 8px;
      border-width: 2px;
      &::after { width: 3px; height: 3px; }
    }
    .loading-text { font-size: 11px; }
  }
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.pokeball-loader {
  width: 60px;
  height: 60px;
  border: 4px solid #333;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  background: white;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.pokeball-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #FF4757;
  border-bottom: 2px solid #333;
}

.pokeball-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: white;
}

.pokeball-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 50%;
  border: 3px solid #333;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    background-color: #ddd;
    border-radius: 50%;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
  font-weight: bold;
  letter-spacing: 1px;
}
</style>
