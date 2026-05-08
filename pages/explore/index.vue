<template>
  <view class="explore-container" :class="exploreStore.currentWeather.toLowerCase()">
    <!-- Top Weather Bar -->
    <view class="weather-header">
      <view class="exit-btn" @click="handleExit">
        <CustomIcon name="arrow-left" :size="20" color="#fff" />
      </view>
      <view class="weather-info">
        <text class="weather-icon">{{ getWeatherIcon(exploreStore.currentWeather) }}</text>
        <text class="weather-title">{{ exploreStore.currentWeather }}</text>
      </view>
      <view class="location-info">
        <CustomIcon name="map-marker" :size="20" color="#fff" />
        <text class="location-text">{{ exploreStore.currentLocation }}</text>
      </view>
      <view class="bonus-badge" v-if="currentPokemon">
        <text>Rate +{{ exploreStore.getCaptureBonus(currentPokemon) }}% ✨</text>
      </view>
    </view>

    <!-- Main Explore Area -->
    <view class="explore-view">
      <view class="environment-bg" :class="exploreStore.currentLocation.toLowerCase()">
        <!-- Particle Effects for weather -->
        <view class="particles" v-if="exploreStore.currentWeather === 'Rainy'">
          <view class="drop" v-for="i in 20" :key="i" :style="getRandomPosition()"></view>
        </view>
        <view class="sun-rays" v-if="exploreStore.currentWeather === 'Sunny'"></view>
        <view class="snow-flakes" v-if="exploreStore.currentWeather === 'Snowy'">
          <view class="flake" v-for="i in 20" :key="i" :style="getRandomPosition()"></view>
        </view>
      </view>

      <view class="pokemon-stage" v-if="currentPokemon">
        <image class="pokemon-image animated-float" :class="{ 'shrinking': catchingPhase > 0 }"
          :src="currentPokemon.image" mode="aspectFit" />
        <view class="pokemon-shadow" v-if="catchingPhase === 0"></view>
        <view class="pokemon-info-card" v-if="catchingPhase === 0">
          <text class="p-name">{{ currentPokemon.name_zh }}</text>
          <view class="p-id-row">
            <text class="p-id">#{{ currentPokemon.index }}</text>
            <text class="p-attempts" v-if="catchAttempts > 0">Tries: {{ catchAttempts }}/3</text>
          </view>
        </view>
      </view>

      <!-- Searching State -->
      <view class="searching-state" v-if="!currentPokemon && !exploring">
        <view class="compass-wrap" @click="startExplore">
          <CustomIcon name="compass" :size="50" />
          <text class="explore-text">Explore Area</text>
        </view>
      </view>

      <view class="loading-state" v-if="exploring">
        <Loading :show="true" :fullscreen="false" text="Searching for wild Pokemon..." />
      </view>

      <!-- Catching Animation Area -->
      <view class="catch-scene" v-if="catchingPhase > 0">
        <!-- Flying Ball -->
        <view class="ball-fly" :class="{ 'animated-throw': catchingPhase === 1 }">
          <image class="pokeball-img rotate" v-if="catchingPhase === 1" src="/static/inset/ball.svg" mode="aspectFit" />
        </view>

        <!-- Shaking Ball on Ground -->
        <view class="ball-ground" v-if="catchingPhase >= 2">
          <image class="pokeball-img" :class="{ 'shaking': catchingPhase === 2, 'jump-out': catchingPhase === 4 }"
            src="/static/inset/ball.svg" mode="aspectFit" />
          <view class="catch-stars" v-if="catchingPhase === 3">✨✨✨</view>
        </view>
      </view>
    </view>

    <!-- Interaction Bar -->
    <view class="interaction-bar" v-if="currentPokemon && catchingPhase === 0">
      <view class="tool-item" @click="useBerry = !useBerry" :class="{ active: useBerry }">
        <text class="tool-icon">🍇</text>
        <text class="tool-label">Berry</text>
      </view>

      <view class="main-action" @click="tryCatch">
        <view class="pokeball-trigger">
          <image src="/static/inset/ball.svg" mode="aspectFit" />
        </view>
      </view>

      <view class="tool-item" @click="currentPokemon = null">
        <text class="tool-icon">🏃</text>
        <text class="tool-label">Run</text>
      </view>
    </view>

    <!-- Success/Fail Modals -->
    <view class="modal-overlay" v-if="showResult && catchSuccess">
      <view class="modal-card success-card animated-pop">
        <CustomIcon class="close-icon" name="close-circle" :size="24" color="rgba(0,0,0,0.4)" @click="handleDiscard" />
        <view class="success-glow"></view>
        <view class="confetti-icon">✨</view>
        <image class="modal-img" :src="currentPokemon.image" mode="aspectFit" />
        <text class="modal-title success-text">Gotcha!</text>
        <text class="modal-desc">{{ currentPokemon.name_zh }} was caught</text>
        <view class="input-section">
          <text class="input-label">Give a name for your pokemon</text>
          <input class="name-input" v-model="nickname" :placeholder="currentPokemon.name_zh" />
        </view>
        <button class="btn-primary success-btn" @click="closeResult">Register to Pokedex</button>
      </view>
    </view>

    <view class="modal-overlay" v-if="showResult && !catchSuccess">
      <view class="modal-card fail-card animated-shake">
        <view class="fail-icon">💨</view>
        <text class="modal-title fail-text">{{ catchAttempts >= maxAttempts ? 'Escaped...' : 'Oh no!' }}</text>
        <text class="modal-desc">{{ catchAttempts >= maxAttempts ? currentPokemon.name_zh + ' has run away into the wild.' : currentPokemon.name_zh + ' broke free!' }}</text>
        <button class="btn-primary fail-btn" @click="closeResult">Close</button>
      </view>
    </view>

    <CustomModal :show="showExitModal" title="Ending Adventure" content="Are you sure you want to leave the wild area?"
      confirmText="Leave" cancelText="Wait" @confirm="confirmExit" @cancel="showExitModal = false" />
    <CustomModal :show="showDiscardModal" title="Release Pokemon?"
      content="Are you sure you want to let this pokemon go? It will return to the wild." confirmText="Release"
      cancelText="Cancel" @confirm="confirmDiscard" @cancel="showDiscardModal = false" />
    
    <CustomTabBar current="explore" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { explorePokemon, catchPokemon, updatePlayerPokemon } from '@/api/pocket'
import { useExploreStore } from '@/store/explore'
import Loading from '@/components/Loading.vue'
import CustomModal from '@/components/CustomModal.vue'
import CustomIcon from '@/components/CustomIcon.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const exploreStore = useExploreStore()
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

const currentPokemon = ref(null)
const exploring = ref(false)
const catchingPhase = ref(0) // 0: idle, 1: throwing, 2: shaking, 3: success, 4: fail-bounce
const useBerry = ref(false)
const showResult = ref(false)
const catchSuccess = ref(false)
const nickname = ref('')
const lastCaughtId = ref(null)
const catchAttempts = ref(0)
const maxAttempts = 3
const showDiscardModal = ref(false)

const handleExit = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const confirmExit = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const startExplore = async () => {
  exploring.value = true
  try {
    const res = await explorePokemon()
    if (res && res.pokemon) {
      currentPokemon.value = res.pokemon
      catchAttempts.value = 0
      catchingPhase.value = 0
      // Update weather from server
      if (res.weather) {
        exploreStore.updateEnvironment(res.weather)
      }
    }
  } catch (err) {
    uni.showToast({ title: 'Search failed', icon: 'none' })
  } finally {
    exploring.value = false
  }
}

const tryCatch = async () => {
  if (catchingPhase.value !== 0 || !currentPokemon.value) return

  catchingPhase.value = 1
  catchAttempts.value++

  try {
    const res = await catchPokemon(currentPokemon.value.id, useBerry.value, exploreStore.currentWeather)

    setTimeout(() => {
      catchingPhase.value = 2 // Shaking
      setTimeout(() => {
        if (res.success) {
          catchingPhase.value = 3 // Success
          catchSuccess.value = true
          lastCaughtId.value = res.data.id
          nickname.value = currentPokemon.value.name_zh
          setTimeout(() => { showResult.value = true }, 1000)
        } else {
          if (catchAttempts.value >= maxAttempts) {
            catchingPhase.value = 4
            setTimeout(() => {
              showResult.value = true
              catchSuccess.value = false
            }, 1000)
          } else {
            catchingPhase.value = 4
            setTimeout(() => {
              catchingPhase.value = 0
              uni.showToast({ title: `${currentPokemon.value.name_zh} broke free!`, icon: 'none' })
            }, 800)
          }
        }
      }, 2000)
    }, 800)
  } catch (err) {
    catchingPhase.value = 0
    uni.showToast({ title: err.data?.error || 'Catch failed', icon: 'none' })
  }
}

const closeResult = async () => {
  if (catchSuccess.value && nickname.value && lastCaughtId.value) {
    try {
      await updatePlayerPokemon(lastCaughtId.value, { nickname: nickname.value })
    } catch (err) { }
  }
  showResult.value = false
  currentPokemon.value = null
  useBerry.value = false
  catchingPhase.value = 0
  catchAttempts.value = 0
}

const handleDiscard = () => {
  showDiscardModal.value = true
}

const confirmDiscard = () => {
  showDiscardModal.value = false
  showResult.value = false
  currentPokemon.value = null
  catchingPhase.value = 0
  catchAttempts.value = 0
  uni.showToast({ title: 'Pokemon released', icon: 'none' })
}

const getWeatherIcon = (weather) => {
  const map = { 'Sunny': '☀️', 'Rainy': '🌧️', 'Snowy': '❄️', 'Cloudy': '☁️' }
  return map[weather] || '☀️'
}

const getRandomPosition = () => {
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 2 + 's',
    opacity: Math.random()
  }
}
</script>

<style lang="scss" scoped>
.explore-container {
  height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: background 0.5s;
}

.rainy { background: linear-gradient(180deg, #4A90E2 0%, #B0C4DE 100%); }
.sunny { background: linear-gradient(180deg, #FF7F50 0%, #FFE4B5 100%); }
.snowy { background: linear-gradient(180deg, #A5F2F3 0%, #FFFFFF 100%); }
.cloudy { background: linear-gradient(180deg, #90A4AE 0%, #CFD8DC 100%); }

.weather-header {
  padding: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  z-index: 10;
}

.exit-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active { transform: scale(0.9); }
}

.weather-info { display: flex; align-items: center; gap: 8px; }
.weather-icon { font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.weather-title { font-size: 16px; font-weight: 900; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

.location-info { display: flex; align-items: center; gap: 4px; }
.location-text { font-size: 16px; color: #fff; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.bonus-badge {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  text { color: #fff; font-size: 14px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
}

.explore-view {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.environment-bg {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(180deg, transparent 0%, #7CFC00 100%);
  &.cave { background: linear-gradient(180deg, transparent 0%, #4B4B4B 100%); }
  &.sea { background: linear-gradient(180deg, transparent 0%, #1E90FF 100%); }
  &.forest { background: linear-gradient(180deg, transparent 0%, #228B22 100%); }
}

.pokemon-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
}

.pokemon-image {
  width: 180px;
  height: 180px;
  &.shrinking { animation: shrink-along 0.8s ease-in forwards; }
}

@keyframes shrink-along {
  0% { transform: scale(1) translateY(0); opacity: 1; }
  100% { transform: scale(0) translateY(-100px); opacity: 0; }
}

.pokemon-shadow {
  width: 100px;
  height: 15px;
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
  margin-top: -10px;
}

.pokemon-info-card {
  margin-top: 20px;
  background: rgba(255,255,255,0.9);
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.p-name { font-size: 20px; font-weight: 800; color: $color-text-primary; }
.p-id-row { display: flex; align-items: center; gap: 10px; }
.p-id { font-size: 12px; color: $color-text-light; }
.p-attempts { font-size: 10px; color: $color-primary; font-weight: bold; }

.catch-scene {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.ball-fly { position: absolute; bottom: 100px; }
.ball-ground { position: absolute; bottom: 40%; display: flex; flex-direction: column; align-items: center; }
.pokeball-img { width: 50px; height: 50px; }
.shaking { animation: ball-shake 0.5s infinite; }

@keyframes ball-shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

.jump-out { animation: ball-jump 0.8s ease-out; }

@keyframes ball-jump {
  0% { transform: scale(1) translateY(0); opacity: 1; }
  50% { transform: scale(1.2) translateY(-50px); opacity: 0.8; }
  100% { transform: scale(0.5) translateY(0); opacity: 0; }
}

.catch-stars { font-size: 20px; margin-top: -60px; animation: fadeIn 0.5s infinite; }

.searching-state { display: flex; flex-direction: column; align-items: center; }
.compass-wrap {
  width: 150px; height: 150px;
  background: rgba(255,255,255,0.9);
  border-radius: 75px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  animation: pulse 2s infinite;
  &:active { transform: scale(0.95); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.explore-text { font-size: 14px; font-weight: bold; color: $color-primary; margin-top: 10px; }

.interaction-bar {
  padding: 40px 20px 100px;
  display: flex; justify-content: center; align-items: center; gap: 40px;
  z-index: 10;
}

.tool-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.6;
  &.active { opacity: 1; .tool-icon { transform: scale(1.2); } }
}

.tool-icon { font-size: 30px; transition: transform 0.2s; }
.tool-label { font-size: 12px; font-weight: bold; color: $color-text-secondary; }

.main-action {
  width: 80px; height: 80px; background: #fff; border-radius: 40px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 4px solid $color-primary;
  &:active { transform: scale(0.9); }
}

.pokeball-trigger { width: 60px; height: 60px; image { width: 100%; height: 100%; } }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; justify-content: center; align-items: center;
}

.success-card {
  background: linear-gradient(180deg, #FFFFFF 0%, #F0FFF4 100%);
  width: 80%; border-radius: 30px; padding: 30px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  position: relative;
}

.success-glow {
  position: absolute; top: 20px; width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(72,187,120,0.15) 0%, transparent 70%);
}

.close-icon { position: absolute; top: 20px; left: 20px; opacity: 0.4; z-index: 20; }
.modal-img { width: 150px; height: 150px; z-index: 5; margin-bottom: 10px; }
.success-text { color: #2ED573; font-size: 28px; font-weight: 800; margin-bottom: 5px; }
.modal-desc { font-size: 14px; color: $color-text-secondary; margin-bottom: 20px; }
.input-section { width: 100%; margin-bottom: 20px; text-align: left; }
.input-label { font-size: 12px; color: $color-text-light; margin-bottom: 8px; display: block; }
.name-input {
  width: 100%; height: 46px; background: #F5F6FA; border-radius: 12px;
  padding: 0 15px; font-size: 16px; box-sizing: border-box;
}

.btn-primary {
  width: 100%; height: 50px; border-radius: 25px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; color: #fff;
}

.success-btn { background: linear-gradient(135deg, #2ED573 0%, #7BED9F 100%); }
.fail-btn { background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%); }

.particles, .snow-flakes {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;
}

.drop, .flake {
  position: absolute; background: #fff; width: 2px; height: 10px; opacity: 0.6;
  animation: fall 1s linear infinite;
}

.flake { width: 4px; height: 4px; border-radius: 50%; }

@keyframes fall {
  from { transform: translateY(-10px); }
  to { transform: translateY(300px); }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
</style>
