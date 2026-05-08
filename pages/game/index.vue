<template>
  <view class="game-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-top">
        <view class="exit-btn" @click="handleExit">
          <CustomIcon name="arrow-left" :size="24" color="#333" />
        </view>
        <text class="greeting">Who's That?</text>
      </view>
      <text class="subtitle">Test your pokemon knowledge.</text>
    </view>

    <view class="game-view" v-if="targetPokemon">
      <!-- Silhouette / Reveal Area -->
      <view class="pokemon-reveal-box" @click="goToDetail">
        <view class="reveal-bg"></view>
        <image class="target-img" :class="{ silhouette: !revealed }" :src="targetPokemon.image" mode="aspectFit" />
        <view class="reveal-circle" v-if="!revealed"></view>
      </view>

      <!-- Question -->
      <view class="question-area">
        <text class="question-text" v-if="!revealed">Who's that Pokemon?</text>
        <view class="answer-revealed" v-else>
          <view class="click-tip" v-if="!hasClickedTip" @click="goToDetail">
            <text>Tap to View Details 👆</text>
          </view>
          <view class="reveal-info" @click="goToDetail">
            <text class="answer-name">{{ targetPokemon.name_zh }}</text>
            <text class="answer-id">#{{ targetPokemon.index }}</text>
          </view>
        </view>
      </view>

      <!-- Options -->
      <view class="options-grid">
        <view class="option-btn" v-for="(opt, idx) in options" :key="idx" @click="checkAnswer(opt)"
          :class="getOptionClass(opt)">
          <text>{{ opt.name_zh }}</text>
          <CustomIcon class="result-icon-img" v-if="revealed && opt.id === targetPokemon.id" name="check" :size="18"
            color="#fff" />
          <CustomIcon class="result-icon-img"
            v-if="revealed && selectedAnswer && opt.id === selectedAnswer.id && opt.id !== targetPokemon.id"
            name="close" :size="18" color="#fff" />
        </view>
      </view>

      <!-- Action Area (Feedback + Next Button) -->
      <view class="action-area">
        <view class="next-area" v-if="revealed">
          <button class="next-btn" @click="startNewGame">Next One</button>
        </view>
      </view>
    </view>

    <view class="loading-state" v-else>
      <Loading :show="true" :fullscreen="false" text="Preparing game..." />
    </view>

    <!-- Score Footer -->
    <view class="score-footer">
      <view class="score-item">
        <text class="s-label">Score</text>
        <text class="s-value">{{ score }}</text>
      </view>
      <view class="score-item">
        <text class="s-label">Correct</text>
        <text class="s-value">{{ correctCount }}</text>
      </view>
    </view>

    <!-- Custom Exit Modal -->
    <CustomModal :show="showExitModal" title="Quit Game"
      content="Progress for this round will be lost. Are you sure you want to exit?" confirmText="Quit"
      cancelText="Continue" @confirm="confirmExit" @cancel="showExitModal = false" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAllPokemon, getGameRandomPokemon } from '@/api/pocket'
import Loading from '@/components/Loading.vue'
import CustomModal from '@/components/CustomModal.vue'
import CustomIcon from '@/components/CustomIcon.vue'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const targetPokemon = ref(null)
const options = ref([])
const revealed = ref(false)
const selectedAnswer = ref(null)
const score = ref(0)
const correctCount = ref(0)
const isCorrect = ref(false)
const showExitModal = ref(false)
const hasClickedTip = ref(uni.getStorageSync('game_detail_tip_clicked') || false)

const handleExit = () => {
  showExitModal.value = true
}

const confirmExit = () => {
  showExitModal.value = false
  uni.switchTab({ url: '/pages/home/index' })
}

const startNewGame = async () => {
  targetPokemon.value = null
  revealed.value = false
  selectedAnswer.value = null
  isCorrect.value = false

  try {
    const list = await getGameRandomPokemon()
    if (list && list.length > 0) {
      // The first one is the target, or we just pick one randomly
      const targetIdx = 0
      targetPokemon.value = list[targetIdx]
      // Shuffle all for options
      options.value = [...list].sort(() => Math.random() - 0.5)
    }
  } catch (err) {
    console.error(err)
  }
}

const goToDetail = () => {
  if (!revealed.value || !targetPokemon.value) return

  if (!hasClickedTip.value) {
    hasClickedTip.value = true
    uni.setStorageSync('game_detail_tip_clicked', true)
  }

  // Use index as ID for the detail page
  const detailId = targetPokemon.value.index
  console.log('Navigating to pokemon with index:', detailId)
  uni.navigateTo({
    url: `/pages/detail/index?id=${detailId}`
  })
}

const checkAnswer = (opt) => {
  if (revealed.value) return
  selectedAnswer.value = opt
  revealed.value = true

  if (opt.id === targetPokemon.value.id) {
    isCorrect.value = true
    score.value += 10
    correctCount.value++
    uni.vibrateShort()
  } else {
    isCorrect.value = false
    uni.vibrateLong()
  }
}

const getOptionClass = (opt) => {
  if (!revealed.value) return ''
  if (opt.id === targetPokemon.value.id) return 'correct'
  if (selectedAnswer.value && opt.id === selectedAnswer.value.id) return 'wrong'
  return 'dimmed'
}

onShow(() => {
  if (!targetPokemon.value) {
    startNewGame()
  }
})
</script>

<style lang="scss" scoped>
.game-container {
  height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
  position: relative; // 为 score-footer 提供定位基准
}

.header {
  padding: 20px 20px 10px;
  display: flex;
  flex-direction: column;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.exit-btn {
  width: 32px;
  height: 32px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.9);
  }
}

.exit-icon {
  font-size: 16px;
  color: $color-text-primary;
  font-weight: bold;
}

.greeting {
  font-size: 28px;
  font-weight: 800;
  color: $color-text-primary;
}

.subtitle {
  font-size: 14px;
  padding: 10px 0;
  color: $color-text-secondary;
}

.game-view {
  flex: 1;
  padding: 20px 20px 180px; // 增加底部边距，为绝对定位的 footer 留出空间
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.pokemon-reveal-box {
  width: 220px;
  height: 220px;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
}

.reveal-bg {
  position: absolute;
  width: 150%;
  height: 150%;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.click-tip {
  background-color: rgba($color-primary, 0.08);
  padding: 6px 20px;
  border-radius: 14px;
  animation: fadeIn 0.5s ease-out;
  cursor: pointer;

  text {
    font-size: 12px;
    color: $color-primary;
    font-weight: 800;
  }

  &:active {
    transform: scale(0.95);
    background-color: rgba($color-primary, 0.15);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.target-img {
  width: 160px;
  height: 160px;
  z-index: 5;
  transition: all 0.5s;

  &.silhouette {
    filter: brightness(0);
  }
}

.question-area {
  margin-bottom: 20px;
  text-align: center;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.question-text {
  font-size: 20px;
  font-weight: 800;
  color: $color-text-primary;
}

.answer-revealed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: slideUp 0.4s ease-out;
}

.reveal-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.answer-name {
  font-size: 24px;
  font-weight: 900;
  color: $color-primary;
}

.answer-id {
  font-size: 14px;
  color: $color-text-light;
}

.options-grid {
  width: 100%;
  height: 135px; // 固定两行高度 (60*2 + 15)
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.option-btn {
  background-color: #fff;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;

  text {
    font-size: 15px;
    font-weight: bold;
    color: $color-text-primary;
  }

  &:active {
    transform: scale(0.95);
  }

  &.correct {
    background-color: #2ED573;
    border-color: #2ED573;

    text {
      color: #fff;
    }
  }

  &.wrong {
    background-color: #FF4757;
    border-color: #FF4757;

    text {
      color: #fff;
    }
  }

  &.dimmed {
    opacity: 0.5;
  }
}

.result-icon-img {
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
}

.action-area {
  width: 100%;
  height: 150px; // 固定反馈区+按钮的高度
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.next-area {
  width: 100%;
  padding: 20px 0;
}

.next-btn {
  width: 100%;
  height: 54px;
  background-color: $color-text-primary;
  color: #fff;
  border-radius: 27px;
  font-weight: 800;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 40px; // 增加底部边距适配 TabBar
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.s-label {
  font-size: 12px;
  color: $color-text-light;
  margin-bottom: 4px;
}

.s-value {
  font-size: 20px;
  font-weight: 900;
  color: $color-text-primary;
}

.loading-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
