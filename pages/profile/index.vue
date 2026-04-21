<template>
  <view class="container">
    <text class="title">My Profile</text>
    
    <view v-if="player" class="profile-card">
      <view class="avatar">👦</view>
      <text class="username">{{ player.username }}</text>
      
      <view class="stats">
        <view class="stat-item">
          <text class="stat-value">🪙 {{ player.coins }}</text>
          <text class="stat-label">Coins</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">🔴 {{ player.pokeballs }}</text>
          <text class="stat-label">Pokeballs</text>
        </view>
      </view>
      
      <button class="btn-buy" @click="buyMorePokeballs" :disabled="buying">
        Buy 10 Pokeballs (100 Coins)
      </button>
    </view>
    
    <text class="subtitle">My Partners</text>
    <scroll-view scroll-y class="my-pokemon-list">
      <view class="pokemon-item" v-for="item in myPokemon" :key="item.id">
        <image 
          class="pkmn-img" 
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Number(item.pokemon_info.index)}.png`" 
          mode="aspectFit"
        />
        <view class="pkmn-info">
          <text class="pkmn-name">{{ item.pokemon_info.name }}</text>
          <text class="pkmn-iv">IV: {{ item.iv }}/31</text>
          <text class="pkmn-date">{{ formatDate(item.catch_time) }}</text>
        </view>
      </view>
      <view v-if="myPokemon.length === 0" class="empty">
        <text>No partners yet.</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getPlayerInfo, getUserPokemon, buyPokeballs } from '../../api/pocket'

const player = ref(null)
const myPokemon = ref([])
const buying = ref(false)

const loadData = async () => {
  try {
    player.value = await getPlayerInfo()
    myPokemon.value = await getUserPokemon()
  } catch (err) {
    console.error(err)
  }
}

const buyMorePokeballs = async () => {
  buying.value = true
  try {
    const res = await buyPokeballs(10)
    player.value = res
    uni.showToast({ title: 'Purchase successful', icon: 'success' })
  } catch (err) {
    uni.showToast({ title: 'Not enough coins', icon: 'none' })
  } finally {
    buying.value = false
  }
}

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onShow(() => {
  loadData()
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
.subtitle {
  font-size: 18px;
  font-weight: bold;
  color: #555;
  margin: 30px 0 15px;
  display: block;
}
.profile-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}
.avatar {
  font-size: 60px;
  margin-bottom: 10px;
}
.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
.stats {
  display: flex;
  width: 100%;
  justify-content: space-around;
  margin-bottom: 25px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-value {
  font-size: 18px;
  font-weight: bold;
}
.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}
.btn-buy {
  background: #ffb142;
  color: white;
  border-radius: 20px;
  border: none;
  width: 80%;
  font-weight: bold;
}
.my-pokemon-list {
  display: flex;
  flex-direction: column;
}
.pokemon-item {
  background: white;
  border-radius: 15px;
  padding: 10px 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.pkmn-img {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  background: #f9f9f9;
  border-radius: 30px;
}
.pkmn-info {
  display: flex;
  flex-direction: column;
}
.pkmn-name {
  font-size: 16px;
  font-weight: bold;
}
.pkmn-iv {
  font-size: 14px;
  color: #ff4757;
  font-weight: bold;
  margin: 2px 0;
}
.pkmn-date {
  font-size: 12px;
  color: #999;
}
.empty {
  text-align: center;
  color: #888;
  margin-top: 20px;
}
</style>
