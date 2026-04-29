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
        <view class="filter-toggle" :class="{ active: showFilters }" @click="showFilters = !showFilters">
          <text class="toggle-icon">Tune</text>
        </view>
      </view>
    </view>

    <!-- Environment & Filters -->
    <view class="filter-section" v-show="showFilters">
      <view class="env-bar">
        <view class="env-item">
          <text class="env-icon">{{ getWeatherIcon(searchStore.currentWeather) }}</text>
          <text class="env-text">{{ searchStore.currentWeather }}</text>
        </view>
        <view class="env-item">
          <text class="env-icon">📍</text>
          <text class="env-text">{{ searchStore.currentLocation }}</text>
        </view>
      </view>
      
      <scroll-view scroll-x class="filter-scroll">
        <view class="chip-group">
          <view class="filter-chip" :class="{ active: !searchStore.filterType }" @click="searchStore.setFilterType('')">
            <text>All</text>
          </view>
          <TypeTag v-for="t in searchStore.availableTypes" :key="t.name" 
            :typeName="t.name" :typeZh="t.name_zh"
            :class="{ active: searchStore.filterType === t.name_zh }"
            size="small"
            @click="toggleTypeFilter(t.name_zh)" />
        </view>
      </scroll-view>

      <scroll-view scroll-x class="filter-scroll">
        <view class="chip-group">
          <view class="filter-chip habitat" :class="{ active: !searchStore.filterHabitat }" @click="searchStore.setFilterHabitat('')">
            <text>All Habitats</text>
          </view>
          <view class="filter-chip habitat" v-for="h in searchStore.availableHabitats" :key="h.name"
            :class="{ active: searchStore.filterHabitat === h.name_zh }"
            @click="toggleHabitatFilter(h.name_zh)">
            <text>{{ h.name_zh }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="list-header">
      <text class="section-title">Pokemon List</text>
      <view class="owned-badge">
        <text>{{ totalOwned }} Owned</text>
      </view>
    </view>

    <!-- 滚动区域 - 使用绝对定位确保高度正确 -->
    <scroll-view scroll-y class="scroll-area" @scrolltolower="loadMore">
      <Loading :show="initialLoading" :fullscreen="false" text="Searching for Pokemon..." />
      
      <view class="pokemon-grid" v-if="!initialLoading">
        <view class="pokemon-card" v-for="item in pokemonList" :key="item.id" @click="goToDetail(item.index)">
          <view class="bonus-badge" v-if="searchStore.getCaptureBonus(item) > 0">
            <text>Rate ↑</text>
          </view>
          <image class="pokemon-img" :src="item.image" mode="aspectFit" lazy-load />
          <text class="pokemon-name">{{ item.name_zh }}</text>
          <text class="pokemon-owned">#{{ item.index }} • {{ item.owned_count || 0 }} Owned</text>
        </view>
      </view>
      <view class="load-more" v-if="loadingMore">
        <Loading :show="true" :fullscreen="false" size="small" text="Finding more..." />
      </view>
      <view class="load-more" v-if="!hasMore && pokemonList.length > 0">
        <text>No more Pokemon</text>
      </view>
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- TabBar 固定在底部 -->
    <CustomTabBar current="home" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import Loading from '@/components/Loading.vue'
import TypeTag from '@/components/TypeTag.vue'
import { getAllPokemon, getPlayerInfo, getMetadata } from '@/api/pocket'
import { useSearchStore } from '@/store/search'

const searchStore = useSearchStore()

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const showFilters = ref(false)

const pokemonList = ref([])
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)
const initialLoading = ref(false)
const totalOwned = ref(0)
const searchText = ref('')
let searchTimer = null

const loadPokemon = async (page = 1) => {
  if (loadingMore.value || initialLoading.value) return
  
  if (page === 1) initialLoading.value = true
  else loadingMore.value = true
  
  try {
    const res = await getAllPokemon(page, searchText.value, searchStore.filterType, searchStore.filterHabitat)
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
    initialLoading.value = false
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

const toggleTypeFilter = (name) => {
  searchStore.setFilterType(name)
  currentPage.value = 1
  loadPokemon(1)
}

const toggleHabitatFilter = (name) => {
  searchStore.setFilterHabitat(name)
  currentPage.value = 1
  loadPokemon(1)
}

const getWeatherIcon = (weather) => {
  const map = { 'Clear': '☀️', 'Rain': '🌧️', 'Sun': '🔥', 'Sandstorm': '🌪️' }
  return map[weather] || '☀️'
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

onShow(async () => {
  if (searchStore.availableTypes.length === 0) {
    try {
      const meta = await getMetadata()
      searchStore.setMetadata(meta.types, meta.habitats)
    } catch (err) {}
  }
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
  padding: 6px 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-toggle {
  padding: 4px 8px;
  margin-left: 10px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &.active {
    background-color: $color-primary;
    .toggle-icon { color: white; }
  }
}

.toggle-icon {
  font-size: 11px;
  font-weight: bold;
  color: $color-text-secondary;
  text-transform: uppercase;
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
  font-size: 20px;
  font-weight: 800;
  color: $color-text-primary;
}

.filter-section {
  padding: 0 20px;
  margin-bottom: 10px;
}

.env-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.env-item {
  background-color: white;
  padding: 4px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.env-icon {
  font-size: 12px;
}

.env-text {
  font-size: 11px;
  font-weight: bold;
  color: $color-text-secondary;
}

.filter-scroll {
  margin-bottom: 10px;
  white-space: nowrap;
}

.chip-group {
  display: flex;
  gap: 10px;
}

.filter-chip {
  padding: 4px 12px;
  background-color: white;
  border-radius: 8px;
  font-size: 12px;
  color: $color-text-secondary;
  border: 1px solid transparent;
  transition: all 0.2s;

  &.active {
    background-color: $color-primary;
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba($color-primary, 0.2);
  }

  &.habitat {
    &.active {
      background-color: $color-secondary;
      box-shadow: 0 4px 10px rgba($color-secondary, 0.2);
    }
  }
}

.bonus-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #2ED573;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 6px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(46, 213, 115, 0.3);
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
  flex: 1;
  height: 0;
  padding: 0 10px;
  box-sizing: border-box;
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
.bottom-spacer {
  height: 100px;
}
</style>
