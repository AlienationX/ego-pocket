<template>
  <view class="custom-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="greeting">训练师中心</text>
      <text class="subtitle">Manage your trainer profile.</text>
    </view>

    <!-- 个人信息区 -->
    <view class="profile-card" v-if="stats">
      <view class="profile-row">
        <view class="avatar-wrap">
          <image class="avatar-img" src="/static/inset/ball.svg" mode="aspectFit" />
        </view>
        <view class="profile-info">
          <text class="profile-name">{{ stats.player.username }}</text>
          <text class="profile-role">Lv.1 · 新手训练师</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-area">
      <!-- 图鉴进度 -->
      <view class="section" v-if="stats">
        <view class="section-header">
          <text class="section-title">图鉴进度</text>
          <view class="percent-badge">
            <text>{{ stats.pokedex_progress }}%</text>
          </view>
        </view>
        <view class="stat-card">
          <view class="progress-bar-wrap">
            <view class="progress-bar-bg">
              <view class="progress-bar-fill" :style="{ width: stats.pokedex_progress + '%' }" />
            </view>
          </view>
          <view class="stat-row">
            <view class="stat-item">
              <text class="stat-num">{{ stats.caught_count }}</text>
              <text class="stat-label">已捕获</text>
            </view>
            <view class="stat-item">
              <text class="stat-num">{{ stats.seen_count }}</text>
              <text class="stat-label">已发现</text>
            </view>
            <view class="stat-item">
              <text class="stat-num">{{ stats.total_pokemon }}</text>
              <text class="stat-label">总数</text>
            </view>
            <view class="stat-item">
              <text class="stat-num">{{ stats.owned_total }}</text>
              <text class="stat-label">持有</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 背包 -->
      <view class="section" v-if="stats">
        <view class="section-header">
          <text class="section-title">我的背包</text>
        </view>
        <view class="bag-grid">
          <view class="bag-card">
            <text class="bag-icon">🪙</text>
            <text class="bag-count">{{ stats.player.coins }}</text>
            <text class="bag-label">金币</text>
          </view>
          <view class="bag-card">
            <image class="bag-ball-img" src="/static/inset/ball.svg" mode="aspectFit" />
            <text class="bag-count">{{ stats.player.pokeballs }}</text>
            <text class="bag-label">精灵球</text>
          </view>
          <view class="bag-card">
            <text class="bag-icon">🍇</text>
            <text class="bag-count">{{ stats.player.berries }}</text>
            <text class="bag-label">树果</text>
          </view>
        </view>
      </view>

      <!-- 商店 -->
      <view class="section" v-if="stats">
        <view class="section-header">
          <text class="section-title">道具商店</text>
        </view>
        <view class="shop-card" @click="buyMorePokeballs" :class="{ disabled: buying }">
          <view class="shop-left">
            <view class="shop-icon balls-bg">
              <image class="shop-icon-img" src="/static/inset/ball.svg" mode="aspectFit" />
            </view>
            <view class="shop-info">
              <text class="shop-name">精灵球 × 10</text>
              <text class="shop-desc">捕捉宝可梦的基础道具</text>
            </view>
          </view>
          <view class="shop-price-btn">
            <text class="shop-price">🪙 100</text>
          </view>
        </view>
        <view class="shop-card" @click="buyMoreBerries" :class="{ disabled: buying }">
          <view class="shop-left">
            <view class="shop-icon berries-bg">
              <text class="shop-icon-emoji">🍇</text>
            </view>
            <view class="shop-info">
              <text class="shop-name">树果 × 2</text>
              <text class="shop-desc">提升捕获概率 +20%</text>
            </view>
          </view>
          <view class="shop-price-btn">
            <text class="shop-price">🪙 10</text>
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
            <view class="recent-card" v-for="item in stats.recent_catches" :key="item.id"
              @click="goToDetail(item.pokemon_index)">
              <image class="recent-img" :src="item.pokemon_image" mode="aspectFit" />
              <text class="recent-name">{{ item.nickname || item.pokemon_name_zh }}</text>
              <view class="iv-badge">
                <text>IV {{ item.iv }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 设置 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">设置</text>
        </view>
        <view class="menu-card" @click="handleLogout">
          <text class="menu-text danger-text">退出登录</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <CustomTabBar current="profile" />
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import CustomNavBar from '@/components/CustomNavBar.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getPlayerInfo, getPlayerStats, buyPokeballs, buyBerries } from '@/api/pocket'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

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
    // Update cache
    userStore.setCachedPlayerInfo(player.value)
    userStore.setCachedPlayerStats(stats.value)
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

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.reLaunch({ url: '/pages/home/index' })
      }
    }
  })
}

onShow(() => {
  // Use cache if available
  if (userStore.cachedPlayerInfo && userStore.cachedPlayerStats) {
    player.value = userStore.cachedPlayerInfo
    stats.value = userStore.cachedPlayerStats
  } else {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.custom-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background-color: $color-bg;
}

.header {
  padding: 20px 20px 10px;
  display: flex;
  flex-direction: column;
}

.greeting {
  font-size: 28px;
  font-weight: 800;
  color: $color-text-primary;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: $color-text-secondary;
}

/* ===== Profile Card ===== */
.profile-card {
  margin: 10px 20px 0;
  background-color: $color-white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, $color-primary, $color-secondary);
  padding: 3px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: $color-white;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-name {
  font-size: 20px;
  font-weight: 800;
  color: $color-text-primary;
}

.profile-role {
  font-size: 13px;
  color: $color-text-secondary;
}

/* ===== Scroll Area ===== */
.scroll-area {
  flex: 1;
  height: 0;
  width: 100%;
}

/* ===== Section ===== */
.section {
  padding: 15px 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: $color-text-primary;
}

.percent-badge {
  background-color: $color-primary;
  padding: 3px 12px;
  border-radius: 15px;

  text {
    color: $color-white;
    font-size: 12px;
    font-weight: bold;
  }
}

/* ===== Stats Card ===== */
.stat-card {
  background-color: $color-white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.progress-bar-wrap {
  margin-bottom: 18px;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background-color: #ECEEF5;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, $color-primary, $color-secondary);
  transition: width 0.6s ease;
  min-width: 2%;
}

.stat-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 20px;
  font-weight: 800;
  color: $color-text-primary;
}

.stat-label {
  font-size: 12px;
  color: $color-text-secondary;
}

/* ===== Bag Grid ===== */
.bag-grid {
  display: flex;
  gap: 12px;
}

.bag-card {
  flex: 1;
  background-color: $color-white;
  border-radius: 20px;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.bag-icon {
  font-size: 26px;
}

.bag-ball-img {
  width: 26px;
  height: 26px;
}

.bag-count {
  font-size: 20px;
  font-weight: 800;
  color: $color-text-primary;
}

.bag-label {
  font-size: 12px;
  color: $color-text-secondary;
}

/* ===== Shop ===== */
.shop-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $color-white;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  &:active { opacity: 0.7; }
  &.disabled { opacity: 0.4; pointer-events: none; }
}

.shop-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.shop-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balls-bg { background-color: #FFE0E0; }
.berries-bg { background-color: #E0F4FF; }

.shop-icon-img { width: 24px; height: 24px; }
.shop-icon-emoji { font-size: 22px; }

.shop-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shop-name {
  font-size: 15px;
  font-weight: bold;
  color: $color-text-primary;
}

.shop-desc {
  font-size: 11px;
  color: $color-text-secondary;
}

.shop-price-btn {
  background-color: $color-primary;
  border-radius: 15px;
  padding: 6px 14px;
}

.shop-price {
  font-size: 13px;
  font-weight: bold;
  color: $color-white;
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
  width: 110px;
  background-color: $color-white;
  border-radius: 20px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  flex-shrink: 0;

  &:active { opacity: 0.7; }
}

.recent-img { width: 56px; height: 56px; }

.recent-name {
  font-size: 13px;
  font-weight: bold;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
  text-align: center;
}

.iv-badge {
  background-color: rgba($color-primary, 0.1);
  padding: 2px 10px;
  border-radius: 10px;

  text {
    font-size: 11px;
    color: $color-primary;
    font-weight: bold;
  }
}

/* ===== Menu Card ===== */
.menu-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $color-white;
  border-radius: 20px;
  padding: 16px 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  &:active { opacity: 0.7; }
}

.menu-text {
  font-size: 15px;
  font-weight: bold;
  color: $color-text-primary;
}

.danger-text {
  color: $color-danger;
}

.menu-arrow {
  font-size: 20px;
  color: $color-text-light;
}

.bottom-spacer {
  height: 100px;
}
</style>
