<template>
  <view class="container">
    <text class="title">My Pokedex</text>
    
    <view v-if="loading" class="loading">Loading...</view>
    
    <scroll-view v-else scroll-y class="pokedex-grid">
      <view class="dex-item" v-for="item in pokedex" :key="item.id">
        <image 
          class="dex-img" 
          :class="{ 'silhouette': !item.is_caught }"
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Number(item.pokemon_info.index)}.png`" 
          mode="aspectFit"
        />
        <text class="dex-index">#{{ item.pokemon_info.index }}</text>
        <text class="dex-name" v-if="item.is_caught">{{ item.pokemon_info.name }}</text>
        <text class="dex-name unknown" v-else>???</text>
      </view>
      <view v-if="pokedex.length === 0" class="empty">
        <text>No Pokemon encountered yet.\nGo explore!</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPokedex } from '../../api/pocket'

const pokedex = ref([])
const loading = ref(false)

const loadPokedex = async () => {
  loading.value = true
  try {
    const res = await getPokedex()
    pokedex.value = res.sort((a, b) => Number(a.pokemon_info.index) - Number(b.pokemon_info.index))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onShow(() => {
  loadPokedex()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  background: #f0f4f8;
  min-height: 100vh;
}
.title {
  font-size: 24px;
  font-weight: 800;
  color: #333;
  margin-bottom: 20px;
  display: block;
}
.pokedex-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.dex-item {
  width: 30%;
  background: white;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.dex-img {
  width: 80px;
  height: 80px;
  transition: all 0.3s;
}
.silhouette {
  filter: brightness(0) invert(0.5); /* Make it gray/silhouette */
}
.dex-index {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}
.dex-name {
  font-size: 14px;
  font-weight: bold;
  margin-top: 2px;
}
.unknown {
  color: #aaa;
}
.empty {
  text-align: center;
  color: #888;
  margin-top: 50px;
  width: 100%;
}
</style>
