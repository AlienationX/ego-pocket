<template>
  <view class="custom-nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-content">
      <view class="back-btn" v-if="showBack" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <text class="title">{{ title }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

// Simplified status bar height handling for MVP
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.custom-nav-bar {
  width: 100%;
  background-color: transparent;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  position: relative;
}

.back-btn {
  padding: 8px;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 24px;
  height: 24px;
  color: $color-text-primary;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 800;
  color: $color-text-primary;
}
</style>
