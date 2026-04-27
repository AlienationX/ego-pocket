<template>
  <view class="custom-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="greeting">Pokedex</text>
      <text class="subtitle">The collection of pokemon you have.</text>
    </view>

    <view class="search-bar">
      <view class="search-inner">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchText" placeholder="Search by name, #id or nickname" @input="onSearch" />
      </view>
    </view>

    <!-- Empty State -->
    <view class="empty-state" v-if="!loading && pokedex.length === 0">
      <view class="box-illustration">
        <image src="@/static/inset/empty.svg" mode="aspectFit" />
      </view>
      <text class="empty-text">Looks like your pokedex is still empty,\nlet's add your pokemon</text>
    </view>

    <view class="list-header" v-if="pokedex.length > 0">
      <text class="section-title">Pokemon List</text>
    </view>

    <!-- List State -->
    <scroll-view v-if="pokedex.length > 0 || loading" scroll-y class="scroll-area" @scrolltolower="loadMore">
      <view class="pokemon-grid">
        <view class="pokemon-card" v-for="item in pokedex" :key="item.id" @click="goToDetail(item)">
          <image class="pokemon-img"
            :src="item.pokemon_image"
            mode="aspectFit" lazy-load />
          <text class="pokemon-nickname">{{ item.nickname || item.pokemon_name_zh }}</text>
          <text class="pokemon-original">#{{ item.pokemon_index }} • {{ item.pokemon_name_en }}</text>
        </view>
      </view>
      <view class="load-more" v-if="loadingMore">
        <text>Loading...</text>
      </view>
      <view class="load-more" v-if="!hasMore && pokedex.length > 0">
        <text>No more Pokemon</text>
      </view>
    </scroll-view>

    <CustomTabBar current="pokedex" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { getPlayerPokemon } from '@/api/pocket'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

const pokedex = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const searchText = ref('')
let searchTimer = null

const loadPokedex = async (page = 1) => {
  if (page === 1) loading.value = true
  loadingMore.value = true
  try {
    const res = await getPlayerPokemon(page, searchText.value)
    // DRF paginated: { count, next, previous, results }
    if (page === 1) {
      pokedex.value = res.results || res
    } else {
      pokedex.value = [...pokedex.value, ...(res.results || res)]
    }
    hasMore.value = !!res.next
    currentPage.value = page
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
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
    loadPokedex(1)
  }, 500)
}

const goToDetail = (item) => {
  // Navigate to the pokemon detail page using the pokemon's model ID
  if (item.pokemon_id) {
    uni.navigateTo({ url: `/pages/detail/index?id=${item.pokemon_id}` })
  } else if (item.pokemon) {
    uni.navigateTo({ url: `/pages/detail/index?id=${item.pokemon}` })
  }
}

onShow(() => {
  currentPage.value = 1
  hasMore.value = true
  loadPokedex(1)
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
}

.pokemon-img {
  width: 80px;
  height: 80px;
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
