<template>
  <view class="custom-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-left">
        <text class="greeting">Hi Master!</text>
        <text class="subtitle">Welcome back to Pokemon World.</text>
      </view>
      
      <!-- Environment Bar moved to top right -->
      <view class="env-bar">
        <view class="env-item">
          <text class="env-icon">{{ getWeatherIcon(exploreStore.currentWeather) }}</text>
        </view>
        <view class="env-item">
          <text class="env-icon">📍</text>
        </view>
      </view>
    </view>

    <view class="search-bar">
      <view class="search-inner">
        <image class="search-icon-svg" src="/static/icons/magnify.svg" mode="aspectFit" />
        <input class="search-input" v-model="searchText" placeholder="Search by name or #id" @input="onSearch" />
        <view class="filter-toggle" :class="{ active: showFilters }" @click="showFilters = !showFilters">
          <text class="toggle-icon">{{ showFilters ? '✕' : '☰' }}</text>
        </view>
      </view>
    </view>

    <!-- Filter Modal Bottom Sheet -->
    <view class="filter-modal-overlay" v-if="showFilters" @click="showFilters = false">
      <view class="filter-modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">Type</text>
          <text class="modal-close" @click="showFilters = false">✖</text>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view class="checkbox-grid">
            <view class="checkbox-item" @click="pokemonStore.setFilterType('')">
              <view class="checkbox-box" :class="{ checked: !pokemonStore.filterType }"></view>
              <text class="checkbox-label">All</text>
            </view>
            <view class="checkbox-item" v-for="t in pokemonStore.availableTypes" :key="t.name"
              @click="toggleTypeFilter(t.name_zh)">
              <view class="checkbox-box" :class="{ checked: pokemonStore.filterType === t.name_zh }"></view>
              <text class="checkbox-label">{{ t.name_en || t.name }}</text>
            </view>
          </view>
          
          <view class="modal-header" style="margin-top: 30px;">
            <text class="modal-title">Habitat</text>
          </view>
          <view class="checkbox-grid">
            <view class="checkbox-item" @click="pokemonStore.setFilterHabitat('')">
              <view class="checkbox-box" :class="{ checked: !pokemonStore.filterHabitat }"></view>
              <text class="checkbox-label">All</text>
            </view>
            <view class="checkbox-item" v-for="h in pokemonStore.availableHabitats" :key="h.name"
              @click="toggleHabitatFilter(h.name_zh)">
              <view class="checkbox-box" :class="{ checked: pokemonStore.filterHabitat === h.name_zh }"></view>
              <text class="checkbox-label">{{ h.name_en || h.name }}</text>
            </view>
          </view>
          <view class="modal-spacer"></view>
        </scroll-view>
      </view>
    </view>

    <view class="list-header">
      <text class="section-title">Pokemon List</text>
      <view class="owned-badge">
        <text>{{ totalOwned }} Owned</text>
      </view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view scroll-y class="scroll-area" @scrolltolower="loadMore">
      <Loading :show="initialLoading" :fullscreen="false" text="Searching for Pokemon..." />
      
      <view class="pokemon-grid" v-if="!initialLoading">
        <view class="pokemon-card" v-for="item in pokemonList" :key="item.id" @click="goToDetail(item.index)">
          <view class="index-badge">
            <text>#{{ item.index }}</text>
          </view>
          <view class="bonus-badge" v-if="exploreStore.getCaptureBonus(item) > 0">
            <text>Rate ↑</text>
          </view>
          <image class="pokemon-img" :src="item.image" mode="aspectFit" lazy-load />
          <text class="pokemon-name">{{ item.name_zh }}</text>
          <text class="pokemon-owned">{{ item.owned_count || 0 }} Owned</text>
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

    <CustomTabBar current="home" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import Loading from '@/components/Loading.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getAllPokemon, getMetadata } from '@/api/pocket'
import { usePokemonStore } from '@/store/pokemon'
import { useExploreStore } from '@/store/explore'

const pokemonStore = usePokemonStore()
const exploreStore = useExploreStore()
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const showFilters = ref(false)

const pokemonList = ref([])
const currentPage = ref(pokemonStore.homeState.currentPage)
const hasMore = ref(pokemonStore.homeState.hasMore)
const loadingMore = ref(false)
const initialLoading = ref(false)
const totalOwned = ref(0)
const searchText = ref(pokemonStore.homeState.searchText)
let searchTimer = null

const loadPokemon = async (page = 1) => {
  if (loadingMore.value || initialLoading.value) return
  if (page === 1) initialLoading.value = true
  else loadingMore.value = true
  
  try {
    const res = await getAllPokemon(page, searchText.value, pokemonStore.filterType, pokemonStore.filterHabitat)
    const results = res.results || res
    pokemonList.value = page === 1 ? results : [...pokemonList.value, ...results]
    
    hasMore.value = !!res.next
    currentPage.value = page
    
    pokemonStore.setCachedHomePokemon(pokemonList.value)
    pokemonStore.updateHomeState({ 
      currentPage: page, 
      hasMore: hasMore.value,
      searchText: searchText.value
    })
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
    pokemonStore.updateHomeState({ searchText: searchText.value })
    loadPokemon(1)
  }, 500)
}

const toggleTypeFilter = (name) => {
  pokemonStore.setFilterType(name)
  currentPage.value = 1
  loadPokemon(1)
}

const toggleHabitatFilter = (name) => {
  pokemonStore.setFilterHabitat(name)
  currentPage.value = 1
  loadPokemon(1)
}

const fetchMetadata = async () => {
  if (pokemonStore.availableTypes.length > 0) return
  try {
    const res = await getMetadata()
    pokemonStore.setMetadata(res.types, res.habitats)
  } catch (err) { }
}

const getWeatherIcon = (weather) => {
  const map = { 'Sunny': '☀️', 'Rainy': '🌧️', 'Snowy': '❄️', 'Cloudy': '☁️' }
  return map[weather] || '☀️'
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
}

onShow(async () => {
  fetchMetadata()

  if (pokemonStore.cachedHomePokemon.length > 0) {
    pokemonList.value = pokemonStore.cachedHomePokemon
    totalOwned.value = pokemonList.value.reduce((sum, item) => sum + (item.owned_count || 0), 0)
  } else {
    loadPokemon(1)
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
}

.header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.greeting {
  font-size: 26px;
  font-weight: 800;
  color: $color-text-primary;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 13px;
  color: $color-text-secondary;
}

.env-bar {
  display: flex;
  gap: 10px;
}

.env-item {
  width: 36px;
  height: 36px;
  background-color: $color-white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.env-icon {
  font-size: 18px;
}

.search-bar {
  padding: 0 20px 15px;
}

.search-inner {
  display: flex;
  align-items: center;
  background-color: $color-white;
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #ECEEF5;
}

.search-icon-svg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  opacity: 0.4;
}

.filter-toggle {
  width: 36px;
  height: 36px;
  margin-left: 10px;
  border-radius: 12px;
  background-color: $color-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &.active {
    background-color: $color-primary;
    .toggle-icon { color: white; }
  }
}

.toggle-icon {
  font-size: 16px;
  color: $color-text-secondary;
}

.search-input {
  flex: 1;
  font-size: 14px;
  color: $color-text-primary;
}

.list-header {
  padding: 10px 20px 5px;
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
  background-color: rgba($color-primary, 0.1);
  padding: 4px 10px;
  border-radius: 10px;
  text {
    font-size: 11px;
    color: $color-primary;
    font-weight: bold;
  }
}

.scroll-area {
  flex: 1;
  height: 0;
  width: 100%;
}

.pokemon-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 10px 100px;
  justify-content: space-between;
}

.pokemon-card {
  width: 48%;
  margin-bottom: 15px;
  background-color: $color-white;
  border-radius: 20px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  position: relative;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }
}

.index-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  text {
    font-size: 10px;
    font-weight: bold;
    color: #CED4DA;
  }
}

.bonus-badge {
  position: absolute;
  top: 10px;
  left: 12px;
  background-color: #FFF3CD;
  padding: 2px 6px;
  border-radius: 6px;
  text {
    font-size: 9px;
    font-weight: bold;
    color: #856404;
  }
}

.pokemon-img {
  width: 80px;
  height: 80px;
  margin-bottom: 12px;
}

.pokemon-name {
  font-size: 15px;
  font-weight: bold;
  color: $color-text-primary;
  margin-bottom: 4px;
}

.pokemon-owned {
  font-size: 11px;
  color: $color-text-light;
}

.load-more {
  text-align: center;
  padding: 20px;
  text {
    font-size: 12px;
    color: $color-text-light;
  }
}

.bottom-spacer {
  height: 100px;
}

.filter-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.filter-modal-content {
  background-color: $color-primary;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  padding: 40px 25px 30px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-title {
  font-size: 26px;
  font-weight: 800;
  color: $color-text-primary;
}

.modal-close {
  font-size: 24px;
  font-weight: 900;
  color: $color-text-primary;
}

.modal-body {
  flex: 1;
  height: 0;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  &:active { opacity: 0.7; }
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 1.5px solid $color-text-primary;
  border-radius: 3px;
  box-sizing: border-box;
}

.checkbox-box.checked {
  background-color: #FF4757;
  border-color: #FF4757;
}

.checkbox-label {
  font-size: 14px;
  color: $color-text-primary;
  font-weight: 500;
}

.modal-spacer {
  height: 50px;
}
</style>
