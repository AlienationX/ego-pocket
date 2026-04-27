<template>
  <view class="custom-tab-bar">
    <view class="tab-item" :class="{ active: current === 'home' }" @click="switchTab('pages/home/index')">
      <image class="icon" src="/static/tabbar/Home.svg" mode="aspectFit" />
      <text class="text">Pokemon</text>
    </view>
    <view class="tab-item" :class="{ active: current === 'pokedex' }" @click="switchTab('pages/pokedex/index')">
      <image class="icon" src="/static/tabbar/Folder.svg" mode="aspectFit" />
      <text class="text">Pokedex</text>
    </view>
    <view class="tab-item" :class="{ active: current === 'profile' }" @click="switchTab('pages/profile/index')">
      <image class="icon" src="/static/icons/account.svg" mode="aspectFit" />
      <text class="text">Profile</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  current: {
    type: String,
    default: 'home'
  }
})

const switchTab = (path) => {
  uni.switchTab({ url: '/' + path, fail: () => {
    // If not declared as tabbar in pages.json, use reLaunch
    uni.reLaunch({ url: '/' + path })
  }})
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 30px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 999;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: $color-text-light;
  font-weight: bold;
  transition: all 0.3s;
  flex: 1;

  .icon {
    width: 24px;
    height: 24px;
    opacity: 0.5;
    transition: opacity 0.3s;
  }

  .text {
    font-size: 12px;
  }

  &.active {
    color: $color-text-primary;
    .icon {
      opacity: 1;
    }
  }
}
</style>
