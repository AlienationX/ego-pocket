<template>
  <view class="profile-page">
    <!-- 顶部渐变背景区域 -->
    <view class="hero-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <image class="hero-bg" src="/static/pokmon-banner.svg" mode="aspectFill" />
      <view class="hero-overlay" />
      <view class="hero-content">
        <text class="page-title">个人中心</text>
        <view class="avatar-card" v-if="stats">
          <view class="avatar-ring">
            <image class="avatar-img" src="/static/icons/ball.svg" mode="aspectFit" />
          </view>
          <view class="user-info">
            <text class="username">{{ stats.player.username }}</text>
            <view class="level-badge">
              <text class="level-text">Lv. 1</text>
              <text class="level-title">新手训练师</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="content-wrapper">
      <!-- 图鉴进度 -->
      <view class="section glass-section" v-if="stats">
        <view class="progress-card">
          <view class="progress-header">
            <text class="progress-title">图鉴完成度</text>
            <view class="progress-percent-badge">
              <text class="progress-percent">{{ stats.pokedex_progress }}%</text>
            </view>
          </view>
          <view class="progress-bar-bg">
            <view class="progress-bar-fill" :style="{ width: stats.pokedex_progress + '%' }">
              <view class="progress-bar-glow"></view>
            </view>
          </view>
          <view class="progress-stats">
            <view class="progress-stat">
              <text class="progress-stat-num text-gradient-1">{{ stats.caught_count }}</text>
              <text class="progress-stat-label">已捕获</text>
            </view>
            <view class="progress-stat">
              <text class="progress-stat-num text-gradient-2">{{ stats.seen_count }}</text>
              <text class="progress-stat-label">已发现</text>
            </view>
            <view class="progress-stat">
              <text class="progress-stat-num">{{ stats.total_pokemon }}</text>
              <text class="progress-stat-label">总数</text>
            </view>
            <view class="progress-stat">
              <text class="progress-stat-num">{{ stats.owned_total }}</text>
              <text class="progress-stat-label">持有数</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 背包道具 -->
      <view class="section" v-if="stats">
        <view class="section-header">
          <text class="section-title">我的背包</text>
        </view>
        <view class="item-grid">
          <view class="item-card glass-card">
            <view class="item-icon-wrap coins-bg">
              <text class="item-icon-emoji">🪙</text>
            </view>
            <text class="item-name">金币</text>
            <text class="item-count">{{ stats.player.coins }}</text>
          </view>
          <view class="item-card glass-card">
            <view class="item-icon-wrap balls-bg">
              <image class="item-icon-img" src="/static/icons/ball.svg" mode="aspectFit" />
            </view>
            <text class="item-name">精灵球</text>
            <text class="item-count">{{ stats.player.pokeballs }}</text>
          </view>
          <view class="item-card glass-card">
            <view class="item-icon-wrap berries-bg">
              <text class="item-icon-emoji">🍇</text>
            </view>
            <text class="item-name">树果</text>
            <text class="item-count">{{ stats.player.berries }}</text>
          </view>
        </view>
      </view>

      <!-- 商店 -->
      <view class="section" v-if="stats">
        <view class="section-header">
          <text class="section-title">道具商店</text>
        </view>
        <view class="shop-list">
          <view class="shop-item glass-card" @click="buyMorePokeballs" :class="{ disabled: buying }">
            <view class="shop-item-left">
              <view class="shop-icon-wrap balls-bg">
                <image class="shop-icon-img" src="/static/icons/ball.svg" mode="aspectFit" />
              </view>
              <view class="shop-item-info">
                <text class="shop-item-name">精灵球 × 10</text>
                <text class="shop-item-desc">捕捉宝可梦的基础道具</text>
              </view>
            </view>
            <view class="shop-price-btn">
              <text class="shop-price">🪙 100</text>
            </view>
          </view>
          <view class="shop-item glass-card" @click="buyMoreBerries" :class="{ disabled: buying }">
            <view class="shop-item-left">
              <view class="shop-icon-wrap berries-bg">
                <text class="shop-icon-emoji">🍇</text>
              </view>
              <view class="shop-item-info">
                <text class="shop-item-name">树果 × 2</text>
                <text class="shop-item-desc">提升捕获概率 +20%</text>
              </view>
            </view>
            <view class="shop-price-btn">
              <text class="shop-price">🪙 10</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 最近捕获 -->
      <view class="section" v-if="stats && stats.recent_catches.length > 0">
        <view class="section-header">
          <text class="section-title">最近捕获</text>
        </view>
        <scroll-view scroll-x class="recent-scroll" :show-scrollbar="false">
          <view class="recent-list">
            <view class="recent-card glass-card" v-for="item in stats.recent_catches" :key="item.id"
              @click="goToDetail(item.pokemon_index)">
              <view class="recent-img-bg">
                <image class="recent-img" :src="item.pokemon_image" mode="aspectFit" />
              </view>
              <text class="recent-name">{{ item.nickname || item.pokemon_name_zh }}</text>
              <text class="recent-iv">IV {{ item.iv }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="bottom-spacer" />
    </view>
    
    <CustomTabBar current="profile" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomNavBar from '@/components/CustomNavBar.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getPlayerInfo, getPlayerStats, buyPokeballs, buyBerries } from '@/api/pocket'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const player = ref(null)
const stats = ref(null)
const buying = ref(false)
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    player.value = await getPlayerInfo()
    stats.value = await getPlayerStats()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const buyMorePokeballs = async () => {
  if (buying.value) return
  buying.value = true
  try {
    await buyPokeballs(10)
    await loadData()
    uni.showToast({ title: '购买成功！', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '金币不足', icon: 'none' })
  } finally {
    buying.value = false
  }
}

const buyMoreBerries = async () => {
  if (buying.value) return
  buying.value = true
  try {
    await buyBerries(2)
    await loadData()
    uni.showToast({ title: '购买成功！', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: '金币不足', icon: 'none' })
  } finally {
    buying.value = false
  }
}

const goToDetail = (pokemonIndex) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${pokemonIndex}` })
}

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #F4F6FA;
  position: relative;
  overflow-x: hidden;
}

/* ===== Hero ===== */
.hero-section {
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
  background: linear-gradient(135deg, #2A365C 0%, #171E36 100%);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  box-shadow: 0 10px 30px rgba(23, 30, 54, 0.15);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.4;
  mix-blend-mode: overlay;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(23, 30, 54, 0.2) 0%, rgba(23, 30, 54, 0.9) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 20px 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 24px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
}

/* ===== Avatar Card (Glassmorphism) ===== */
.avatar-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.avatar-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #FFD93D, #6C5CE7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #FFFFFF;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.username {
  font-size: 24px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.level-text {
  font-size: 13px;
  font-weight: 800;
  color: #FFD93D;
}

.level-title {
  font-size: 12px;
  color: #E2E8F0;
  font-weight: 500;
}

/* ===== Content Wrapper ===== */
.content-wrapper {
  padding: 0 20px;
  margin-top: -20px;
  position: relative;
  z-index: 10;
}

/* ===== General Section ===== */
.section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
  padding-left: 4px;
}

.section-title {
  font-size: 19px;
  font-weight: 800;
  color: #1E293B;
  letter-spacing: 0.5px;
}

/* ===== Glass Card Utility ===== */
.glass-card {
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* ===== Progress Card ===== */
.progress-card {
  @extend .glass-card;
  padding: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 17px;
  font-weight: 800;
  color: #1E293B;
}

.progress-percent-badge {
  background: rgba(108, 92, 231, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.progress-percent {
  font-size: 16px;
  font-weight: 800;
  color: #6C5CE7;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: #E2E8F0;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #3ECDA8 0%, #6C5CE7 100%);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-bar-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%);
  filter: blur(2px);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  background: #F8FAFC;
  padding: 16px;
  border-radius: 16px;
}

.progress-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  position: relative;
}

.progress-stat:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background: #E2E8F0;
}

.progress-stat-num {
  font-size: 20px;
  font-weight: 800;
  color: #1E293B;
}

.text-gradient-1 {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-2 {
  background: linear-gradient(135deg, #6C5CE7, #8E7CFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-stat-label {
  font-size: 12px;
  color: #64748B;
  font-weight: 600;
}

/* ===== Items Grid ===== */
.item-grid {
  display: flex;
  gap: 16px;
}

.item-card {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4px 12px rgba(149, 157, 165, 0.05);
  }
}

.item-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
}

.coins-bg { background: linear-gradient(135deg, #FFEAA7, #FDCB6E); }
.balls-bg { background: linear-gradient(135deg, #FFD0D0, #FF7675); }
.berries-bg { background: linear-gradient(135deg, #C7ECEE, #7ED6DF); }

.item-icon-emoji { font-size: 28px; }
.item-icon-img { width: 34px; height: 34px; }

.item-name {
  font-size: 13px;
  color: #64748B;
  font-weight: 700;
}

.item-count {
  font-size: 22px;
  font-weight: 800;
  color: #1E293B;
}

/* ===== Shop ===== */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shop-item {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, opacity 0.2s;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.5; filter: grayscale(50%); pointer-events: none; }
}

.shop-item-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.shop-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shop-icon-img { width: 28px; height: 28px; }
.shop-icon-emoji { font-size: 24px; }

.shop-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shop-item-name {
  font-size: 16px;
  font-weight: 800;
  color: #1E293B;
}

.shop-item-desc {
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
}

.shop-price-btn {
  background: linear-gradient(135deg, #FDCB6E 0%, #E1B12C 100%);
  border-radius: 20px;
  padding: 8px 16px;
  box-shadow: 0 4px 12px rgba(225, 177, 44, 0.3);
}

.shop-price {
  font-size: 15px;
  font-weight: 800;
  color: #2D3436;
}

/* ===== Recent Catches ===== */
.recent-scroll {
  white-space: nowrap;
  width: 100%;
}

.recent-list {
  display: flex;
  gap: 16px;
  padding: 4px 0 16px 4px;
}

.recent-card {
  width: 130px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  transition: transform 0.2s;

  &:active { transform: scale(0.96); }
}

.recent-img-bg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(108,92,231,0.1) 0%, rgba(255,255,255,0) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-img { width: 68px; height: 68px; }

.recent-name {
  font-size: 14px;
  font-weight: 800;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.recent-iv {
  font-size: 12px;
  color: #3ECDA8;
  font-weight: 800;
  background: rgba(62, 205, 168, 0.15);
  padding: 4px 12px;
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.bottom-spacer {
  height: 120px;
}
</style>
