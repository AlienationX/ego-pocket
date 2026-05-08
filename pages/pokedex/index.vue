<template>
  <view class="custom-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="greeting">Pokedex</text>
      <text class="subtitle">The collection of pokemon you have.</text>
    </view>

    <view class="search-bar">
      <view class="search-inner">
        <image class="search-icon-svg" src="/static/icons/magnify.svg" mode="aspectFit" />
        <input class="search-input" v-model="searchText" placeholder="Search by name, #id or nickname"
          @input="onSearch" />
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
            <view class="checkbox-item" @click="toggleTypeFilter('')">
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
            <view class="checkbox-item" @click="toggleHabitatFilter('')">
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

    <!-- Empty State -->
    <view class="empty-state" v-if="!initialLoading && pokedex.length === 0">
      <view class="box-illustration">
        <image src="@/static/inset/empty.svg" mode="aspectFit" />
      </view>
      <text class="empty-text">Looks like your pokedex is still empty,\nlet's add your pokemon</text>
    </view>

    <view class="list-header" v-if="pokedex.length > 0">
      <text class="section-title">Pokemon List</text>
    </view>

    <!-- List State -->
    <scroll-view v-if="pokedex.length > 0 || initialLoading" scroll-y class="scroll-area" 
      @scrolltolower="loadMore">
      <Loading :show="initialLoading" :fullscreen="false" text="Syncing Pokedex..." />
      
      <view class="pokemon-grid" v-if="!initialLoading">
        <view class="pokemon-card" v-for="item in pokedex" :key="item.id" @click="goToDetail(item)">
          <view class="index-badge">
            <text>#{{ item.pokemon_index }}</text>
          </view>
          <image class="pokemon-img" :src="item.pokemon_image" mode="aspectFit" lazy-load />
          <text class="pokemon-nickname">{{ item.nickname || item.pokemon_name_zh }}</text>
          <text class="pokemon-original">{{ item.pokemon_name_en }}</text>
        </view>
      </view>
      <view class="load-more" v-if="loadingMore">
        <Loading :show="true" :fullscreen="false" size="small" text="Syncing more..." />
      </view>
      <view class="load-more" v-if="!hasMore && pokedex.length > 0">
        <text>No more Pokemon</text>
      </view>
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- TabBar 固定在底部 -->
    <CustomTabBar current="pokedex" />
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import Loading from '@/components/Loading.vue'
import { getPlayerPokemon, getMetadata } from '@/api/pocket'
import { usePokemonStore } from '@/store/pokemon'

const pokemonStore = usePokemonStore()

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const showFilters = ref(false)

const pokedex = ref([])
const initialLoading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(pokemonStore.pokedexState.currentPage)
const hasMore = ref(pokemonStore.pokedexState.hasMore)
const searchText = ref(pokemonStore.pokedexState.searchText)
let searchTimer = null

const loadPokedex = async (page = 1) => {
  if (loadingMore.value || initialLoading.value) return
  
  if (page === 1) initialLoading.value = true
  else loadingMore.value = true
  
  try {
    const res = await getPlayerPokemon(page, searchText.value, pokemonStore.filterType, pokemonStore.filterHabitat)
    // DRF paginated: { count, next, previous, results }
    const results = res.results || res
    pokedex.value = page === 1 ? results : [...pokedex.value, ...results]
    
    hasMore.value = !!res.next
    currentPage.value = page
    
    // Update store state
    pokemonStore.setCachedPokedex(pokedex.value)
    pokemonStore.updatePokedexState({
      currentPage: page,
      hasMore: hasMore.value,
      searchText: searchText.value
    })
  } catch (err) {
    console.error(err)
  } finally {
    initialLoading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return
  loadPokedex(currentPage.value + 1)
}

const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    hasMore.value = true
    pokemonStore.updatePokedexState({ searchText: searchText.value })
    loadPokedex(1)
  }, 500)
}

const toggleTypeFilter = (name) => {
  pokemonStore.setFilterType(name)
  currentPage.value = 1
  loadPokedex(1)
}

const toggleHabitatFilter = (name) => {
  pokemonStore.setFilterHabitat(name)
  currentPage.value = 1
  loadPokedex(1)
}

onShow(async () => {
  // Load metadata if missing
  if (pokemonStore.availableTypes.length === 0) {
    try {
      const meta = await getMetadata()
      pokemonStore.setMetadata(meta.types, meta.habitats)
    } catch (err) {}
  }
  
  // Use cache if available
  if (pokemonStore.cachedPokedex.length > 0) {
    pokedex.value = pokemonStore.cachedPokedex
  } else {
    currentPage.value = 1
    hasMore.value = true
    loadPokedex(1)
  }
})

const goToDetail = (item) => {
  // Navigate to the pokemon detail page using the pokemon's model ID
  if (item.pokemon_index) {
    uni.navigateTo({ url: `/pages/detail/index?id=${item.pokemon_index}` })
  }
}
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

.search-bar {
  padding: 0 20px 15px;
}

.search-inner {
  display: flex;
  align-items: center;
  background-color: $color-white;
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
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
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: $color-text-primary;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
}

.box-illustration {
  width: 160px;
  height: 160px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 30px;

  .box-emoji {
    font-size: 60px;
  }

  .sparks {
    position: absolute;
    top: -20px;
    font-size: 30px;
  }
}

.empty-text {
  text-align: center;
  color: $color-text-secondary;
  font-size: 14px;
  line-height: 1.5;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  position: relative;
}

.index-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;

  text {
    font-size: 11px;
    font-weight: bold;
    color: $color-text-light;
  }
}

.pokemon-img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.pokemon-nickname {
  font-size: 16px;
  font-weight: bold;
  color: $color-text-primary;
  margin-bottom: 5px;
  text-align: center;
}

.pokemon-original {
  font-size: 11px;
  color: $color-text-secondary;
}

/* Modal Overlay */
.filter-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Slide from top */
}

.filter-modal-content {
  background-color: $color-primary; /* Yellow Modal Background */
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
  background-color: $color-danger; /* Red checkbox active */
  border-color: $color-danger;
}

.checkbox-label {
  font-size: 15px;
  color: $color-text-primary;
  font-weight: 500;
  text-transform: capitalize;
}

.modal-spacer {
  height: 100px;
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
