<template>
  <view class="custom-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="greeting">Hi Master!</text>
      <text class="subtitle">Welcome back to Pokemon World.</text>
    </view>
    
    <view class="search-bar">
      <view class="search-inner">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchText" placeholder="Search by name or #id" @input="onSearch" />
      </view>
    </view>

    <view class="list-header">
      <text class="section-title">Pokemon List</text>
      <view class="owned-badge">
        <text>{{ totalOwned }} Owned</text>
      </view>
    </view>

    <!-- 滚动区域 - 使用绝对定位确保高度正确 -->
    <scroll-view scroll-y class="scroll-area" @scrolltolower="loadMore">
      <view class="pokemon-grid">
        <view class="pokemon-card" v-for="item in pokemonList" :key="item.id" @click="goToDetail(item.id)">
          <image class="pokemon-img" :src="item.image" mode="aspectFit" lazy-load />
          <text class="pokemon-name">{{ item.name_zh }}</text>
          <text class="pokemon-owned">#{{ item.index }} • {{ item.owned_count || 0 }} Owned</text>
        </view>
      </view>
      <view class="load-more" v-if="loadingMore">
        <text>Loading...</text>
      </view>
      <view class="load-more" v-if="!hasMore && pokemonList.length > 0">
        <text>No more Pokemon</text>
      </view>
    </scroll-view>

    <!-- TabBar 固定在底部 -->
    <CustomTabBar current="home" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getAllPokemon, getPlayerInfo } from '@/api/pocket'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

const pokemonList = ref([])
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const totalOwned = ref(0)
const searchText = ref('')
let searchTimer = null

const loadPokemon = async (page = 1) => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const res = await getAllPokemon(page, searchText.value)
    // DRF pagination response: { count, next, previous, results }
    if (page === 1) {
      pokemonList.value = res.results || res
    } else {
      pokemonList.value = [...pokemonList.value, ...(res.results || res)]
    }
    hasMore.value = !!res.next
    currentPage.value = page
  } catch (err) {
    console.error(err)
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return
  loadPokemon(currentPage.value + 1)
}

const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    hasMore.value = true
    loadPokemon(1)
  }, 500)
}

const loadPlayerOwned = async () => {
  try {
    const player = await getPlayerInfo()
    // totalOwned is computed from the list, or from player
  } catch (err) { }
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

onShow(() => {
  currentPage.value = 1
  hasMore.value = true
  loadPokemon(1)
  // Compute totalOwned from loaded list
  setTimeout(() => {
    totalOwned.value = pokemonList.value.reduce((sum, item) => sum + (item.owned_count || 0), 0)
  }, 500)
})
</script>

<style lang="scss" scoped>
.custom-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background-color: $color-bg;
}

.header {
  padding: 20px;
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

.search-bar {
  padding: 0 20px 15px;
}

.search-inner {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 8px 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-icon {
  margin-right: 10px;
  font-size: 16px;
}

.search-input {
  flex: 1;
  font-size: 14px;
  color: $color-text-primary;
}

.list-header {
  padding: 0 20px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: $color-text-primary;
}

.owned-badge {
  background-color: $color-secondary;
  padding: 4px 12px;
  border-radius: 15px;

  text {
    color: $color-white;
    font-size: 12px;
    font-weight: bold;
  }
}

.scroll-area {
  position: absolute;
  top: 190px;
  left: 0;
  right: 0;
  bottom: 100px;
  padding: 0 10px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.pokemon-grid {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 10px;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}

.pokemon-card {
  width: calc(50% - 8px);
  margin-bottom: 15px;
  background-color: $color-white;
  border-radius: 20px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.pokemon-img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.pokemon-name {
  font-size: 16px;
  font-weight: bold;
  color: $color-text-primary;
  margin-bottom: 5px;
}

.pokemon-owned {
  font-size: 12px;
  color: $color-text-secondary;
}

.load-more {
  text-align: center;
  padding: 15px;

  text {
    font-size: 13px;
    color: $color-text-light;
  }
}
</style>
