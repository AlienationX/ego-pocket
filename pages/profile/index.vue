<template>
  <view class="profile-page">
    <!-- 顶部渐变背景区域 -->
    <view class="hero-section" :style="{ paddingTop: statusBarHeight + 'px' }">
      <image class="hero-bg" src="/static/pokmon-banner.svg" mode="aspectFill" />
      <view class="hero-overlay" />
      <view class="hero-content">
        <text class="page-title">训练师中心</text>
        <view class="avatar-card" v-if="stats">
          <view class="avatar-ring">
            <image class="avatar-img" src="/static/icons/ball.svg" mode="aspectFit" />
          </view>
          <view class="user-info">
            <text class="username">{{ stats.player.username }}</text>
            <text class="user-level">Lv. 1 · 新手训练师</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 图鉴进度 -->
    <view class="section" v-if="stats">
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-title">图鉴完成度</text>
          <text class="progress-percent">{{ stats.pokedex_progress }}%</text>
        </view>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: stats.pokedex_progress + '%' }" />
        </view>
        <view class="progress-stats">
          <view class="progress-stat">
            <text class="progress-stat-num">{{ stats.caught_count }}</text>
            <text class="progress-stat-label">已捕获</text>
          </view>
          <view class="progress-stat">
            <text class="progress-stat-num">{{ stats.seen_count }}</text>
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
      <text class="section-title">我的背包</text>
      <view class="item-grid">
        <view class="item-card">
          <view class="item-icon-wrap coins-bg">
            <text class="item-icon-emoji">🪙</text>
          </view>
          <text class="item-name">金币</text>
          <text class="item-count">{{ stats.player.coins }}</text>
        </view>
        <view class="item-card">
          <view class="item-icon-wrap balls-bg">
            <image class="item-icon-img" src="/static/icons/ball.svg" mode="aspectFit" />
          </view>
          <text class="item-name">精灵球</text>
          <text class="item-count">{{ stats.player.pokeballs }}</text>
        </view>
        <view class="item-card">
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
      <text class="section-title">道具商店</text>
      <view class="shop-list">
        <view class="shop-item" @click="buyMorePokeballs" :class="{ disabled: buying }">
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
        <view class="shop-item" @click="buyMoreBerries" :class="{ disabled: buying }">
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
      <text class="section-title">最近捕获</text>
      <scroll-view scroll-x class="recent-scroll">
        <view class="recent-list">
          <view class="recent-card" v-for="item in stats.recent_catches" :key="item.id"
            @click="goToDetail(item.pokemon_id)">
            <image class="recent-img"
              :src="item.pokemon_image"
              mode="aspectFit" />
            <text class="recent-name">{{ item.nickname || item.pokemon_name_zh }}</text>
            <text class="recent-iv">IV {{ item.iv }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view style="height: 120px;" />
    <CustomTabBar current="profile" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getPlayerStats, buyPokeballs, buyBerries } from '@/api/pocket'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const stats = ref(null)
const buying = ref(false)

const loadData = async () => {
  try {
    stats.value = await getPlayerStats()
  } catch (err) {
    console.error(err)
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

const goToDetail = (pokemonId) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${pokemonId}` })
}

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: $color-bg;
}

/* ===== Hero ===== */
.hero-section {
  position: relative;
  overflow: hidden;
  padding-bottom: 30px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(34, 46, 100, 0.85) 0%, rgba(62, 205, 168, 0.65) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 20px 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 24px;
}

/* ===== Avatar Card ===== */
.avatar-card {
  display: flex;
  align-items: center;
  gap: 18px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.avatar-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD93D, #FF6B6B, #6C5CE7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  flex-shrink: 0;
}

.avatar-img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fff;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.user-level {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

/* ===== Section ===== */
.section {
  padding: 0 20px;
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: $color-text-primary;
  margin-bottom: 14px;
  display: block;
}

/* ===== Progress Card ===== */
.progress-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 16px;
  font-weight: 700;
  color: $color-text-primary;
}

.progress-percent {
  font-size: 20px;
  font-weight: 800;
  color: $color-primary;
}

.progress-bar-bg {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: #ECEEF5;
  overflow: hidden;
  margin-bottom: 18px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, $color-primary, #6C5CE7);
  transition: width 0.6s ease;
  min-width: 2%;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
}

.progress-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.progress-stat-num {
  font-size: 20px;
  font-weight: 800;
  color: $color-text-primary;
}

.progress-stat-label {
  font-size: 12px;
  color: $color-text-secondary;
}

/* ===== Items Grid ===== */
.item-grid {
  display: flex;
  gap: 12px;
}

.item-card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.item-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coins-bg { background: linear-gradient(135deg, #FFF3CD, #FFE066); }
.balls-bg { background: linear-gradient(135deg, #FFE0E0, #FFAAAA); }
.berries-bg { background: linear-gradient(135deg, #E0F4FF, #A0D8EF); }

.item-icon-emoji { font-size: 26px; }
.item-icon-img { width: 30px; height: 30px; }

.item-name {
  font-size: 13px;
  color: $color-text-secondary;
  font-weight: 600;
}

.item-count {
  font-size: 22px;
  font-weight: 800;
  color: $color-text-primary;
}

/* ===== Shop ===== */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-item {
  background: #fff;
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s;

  &:active { transform: scale(0.98); }
  &.disabled { opacity: 0.6; pointer-events: none; }
}

.shop-item-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.shop-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shop-icon-img { width: 26px; height: 26px; }
.shop-icon-emoji { font-size: 22px; }

.shop-item-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.shop-item-name {
  font-size: 15px;
  font-weight: 700;
  color: $color-text-primary;
}

.shop-item-desc {
  font-size: 12px;
  color: $color-text-secondary;
}

.shop-price-btn {
  background: linear-gradient(135deg, #FFD93D, #FFB142);
  border-radius: 20px;
  padding: 8px 16px;
}

.shop-price {
  font-size: 14px;
  font-weight: 700;
  color: #5D3A00;
}

/* ===== Recent Catches ===== */
.recent-scroll {
  white-space: nowrap;
}

.recent-list {
  display: flex;
  gap: 12px;
  padding-bottom: 4px;
}

.recent-card {
  width: 120px;
  background: #fff;
  border-radius: 18px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  transition: transform 0.15s;

  &:active { transform: scale(0.96); }
}

.recent-img { width: 64px; height: 64px; }

.recent-name {
  font-size: 13px;
  font-weight: 700;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.recent-iv {
  font-size: 11px;
  color: $color-primary;
  font-weight: 600;
  background: rgba(62, 205, 168, 0.1);
  padding: 2px 10px;
  border-radius: 10px;
}
</style>
