<template>
  <view class="custom-tab-bar" v-if="!['explore', 'game'].includes(current)">
    <view class="tab-item" :class="{ active: current === 'home' }" @click="switchTab('/pages/home/index', 'home')">
      <CustomIcon class="icon" name="Home" path="/static/tabbar/" :size="24" :color="current === 'home' ? '#333' : '#A3AAB9'" />
      <text class="text">Pokemon</text>
    </view>
    <view class="tab-item" :class="{ active: current === 'pokedex' }"
      @click="switchTab('/pages/pokedex/index', 'pokedex')">
      <CustomIcon class="icon" name="Folder" path="/static/tabbar/" :size="24" :color="current === 'pokedex' ? '#333' : '#A3AAB9'" />
      <text class="text">Pokedex</text>
    </view>
    
    <!-- Middle Pokeball Button -->
    <view class="tab-item middle" @click="switchTab('/pages/explore/index', 'explore')">
      <view class="pokeball-btn">
        <image class="pokeball-icon" src="/static/inset/ball.svg" mode="aspectFit" />
      </view>
    </view>

    <view class="tab-item" :class="{ active: current === 'game' }" @click="switchTab('/pages/game/index', 'game')">
      <CustomIcon class="icon" name="gamepad" :size="24" :color="current === 'game' ? '#333' : '#A3AAB9'" />
      <text class="text">Game</text>
    </view>

    <view class="tab-item" :class="{ active: current === 'profile' }" @click="switchTab('/pages/profile/index', 'profile')">
      <CustomIcon class="icon" name="account" :size="24" :color="current === 'profile' ? '#333' : '#A3AAB9'" />
      <text class="text">Profile</text>
    </view>
  </view>
</template>

<script setup>
import CustomIcon from './CustomIcon.vue'
const props = defineProps({
  current: {
    type: String,
    default: 'home'
  }
})

const switchTab = (url, name) => {
  if (props.current === name) return
  uni.switchTab({ url })
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 94%;
  height: 65px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 35px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  z-index: 999;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 0 5px;
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
  from { transform: translate(-50%, 100%); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #A3AAB9;
  font-weight: bold;
  transition: all 0.3s;
  flex: 1;

  .icon {
    width: 24px;
    height: 24px;
    opacity: 0.5;
    transition: all 0.3s;
  }

  .text {
    font-size: 10px;
  }

  &.active {
    color: #333;

    .icon {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  &.middle {
    flex: 0 0 65px;
    position: relative;
    top: -32.5px;
  }
}

.pokeball-btn {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:active {
    transform: scale(0.85);
  }
}

.pokeball-icon {
  width: 65px;
  height: 65px;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
</style>
