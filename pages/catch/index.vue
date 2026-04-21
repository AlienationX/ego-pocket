<template>
  <view class="container">
    <view class="header">
      <text class="title">Ego Pocket</text>
      <view class="player-info" v-if="player">
        <text>🪙 {{ player.coins }}</text>
        <text style="margin-left: 10px;">🔴 {{ player.pokeballs }}</text>
      </view>
    </view>

    <view class="encounter-area">
      <button class="btn-search" @click="searchPokemon" :disabled="loading">
        {{ loading ? 'Searching...' : 'Explore Area' }}
      </button>

      <view v-if="currentPokemon" class="pokemon-card">
        <image 
          class="pokemon-img" 
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Number(currentPokemon.index)}.png`" 
          mode="aspectFit"
        />
        <text class="pokemon-name">{{ currentPokemon.name }} ({{ currentPokemon.name_en }})</text>
        <view class="types">
          <text class="type-tag" v-for="t in currentPokemon.types" :key="t">{{ t }}</text>
        </view>
        
        <button class="btn-catch" @click="tryCatch" :disabled="catching || !player || player.pokeballs <= 0">
          Throw Pokeball
        </button>
      </view>
    </view>

    <!-- Catch Result Modal -->
    <view class="modal" v-if="catchResult">
      <view class="modal-content">
        <text class="modal-text">{{ catchResult.message }}</text>
        <button @click="catchResult = null">Close</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPlayerInfo, encounterPokemon, catchPokemon } from '../../api/pocket'

const player = ref(null)
const currentPokemon = ref(null)
const loading = ref(false)
const catching = ref(false)
const catchResult = ref(null)

const loadPlayer = async () => {
  try {
    player.value = await getPlayerInfo()
  } catch (err) {
    console.error('Failed to load player', err)
  }
}

const searchPokemon = async () => {
  loading.value = true
  catchResult.value = null
  try {
    currentPokemon.value = await encounterPokemon()
  } catch (err) {
    uni.showToast({ title: 'No pokemon found', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const tryCatch = async () => {
  if (!currentPokemon.value) return
  catching.value = true
  try {
    const res = await catchPokemon(currentPokemon.value.id)
    catchResult.value = res
    if (res.player) {
      player.value = res.player
    }
    if (res.success) {
      currentPokemon.value = null // Disappear if caught
    }
  } catch (err) {
    if (err.data && err.data.error) {
      uni.showToast({ title: err.data.error, icon: 'none' })
    } else {
      uni.showToast({ title: 'Error catching', icon: 'none' })
    }
  } finally {
    catching.value = false
  }
}

onMounted(() => {
  loadPlayer()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  background-color: #f0f4f8;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}
.title {
  font-size: 24px;
  font-weight: 800;
  color: #333;
}
.player-info {
  background: white;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-weight: bold;
}
.encounter-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn-search {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 30px;
  padding: 0 40px;
  height: 50px;
  line-height: 50px;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
  border: none;
  margin-bottom: 30px;
}
.pokemon-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 80%;
  animation: slideUp 0.5s ease;
}
.pokemon-img {
  width: 150px;
  height: 150px;
}
.pokemon-name {
  font-size: 22px;
  font-weight: bold;
  margin: 15px 0 10px;
}
.types {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.type-tag {
  background: #eee;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 14px;
  color: #555;
}
.btn-catch {
  background: #ff4757;
  color: white;
  border-radius: 25px;
  width: 100%;
  border: none;
  font-weight: bold;
  margin-top: 10px;
}
.btn-catch[disabled] {
  background: #ff99a2;
}
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  width: 70%;
}
.modal-text {
  font-size: 18px;
  font-weight: bold;
  display: block;
  margin-bottom: 20px;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
