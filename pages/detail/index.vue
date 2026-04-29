<template>
  <view class="detail-container">
    <CustomNavBar title="Pokemon Detail" :showBack="true" />

    <view class="content" :style="{ paddingTop: statusBarHeight + 44 + 'px' }" v-if="pokemon">
      <!-- Top Info -->
      <view class="top-info">
        <text class="pokemon-name">{{ pokemon.name_zh }}</text>
        <view class="title-row">
          <view class="types">
            <TypeTag v-for="t in pokemon.types_detail" :key="t.id" 
              :typeName="t.name" :typeZh="t.name_zh" 
              size="large" @click="showTypeEffectiveness(t)" />
          </view>
          <text class="pokemon-id">#{{ pokemon.index }}</text>
        </view>
        <view class="bonus-tag" v-if="searchStore.getCaptureBonus(pokemon) > 0">
          <text>✨ 环境加成: 捕获率 +{{ searchStore.getCaptureBonus(pokemon) }}%</text>
        </view>
      </view>

      <!-- Big Image -->
      <view class="image-container">
        <image class="main-img" :src="pokemon.image" mode="aspectFit" />
      </view>

      <!-- Bottom Sheet -->
      <view class="bottom-sheet">
        <view class="tabs">
          <text class="tab" :class="{ active: activeTab === 'about' }" @click="activeTab = 'about'">About</text>
          <text class="tab" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">Base Stats</text>
          <text class="tab" :class="{ active: activeTab === 'evolution' }"
            @click="activeTab = 'evolution'">Evolution</text>
        </view>

        <!-- About Tab -->
        <view class="info-list" v-if="activeTab === 'about'">
          <view class="info-row">
            <text class="label">种类</text>
            <text class="value">{{ pokemon.genera }}</text>
          </view>
          <view class="info-row">
            <text class="label">身高</text>
            <text class="value">{{ pokemon.height }}</text>
          </view>
          <view class="info-row">
            <text class="label">体重</text>
            <text class="value">{{ pokemon.weight }}</text>
          </view>
          <view class="info-row">
            <text class="label">特性</text>
            <view class="value-col">
              <text class="value-item" v-for="a in pokemon.abilities_detail" :key="a.id">{{ a.name_zh }}</text>
            </view>
          </view>

          <text class="section-subtitle">详细信息</text>
          <view class="info-row">
            <text class="label">世代</text>
            <text class="value">{{ pokemon.generation }}</text>
          </view>
          <view class="info-row" v-if="pokemon.habitat_name_zh">
            <text class="label">栖息地</text>
            <text class="value link" @click="handleHabitatClick(pokemon.habitat_name_zh)">{{ pokemon.habitat_name_zh }}</text>
          </view>
          <view class="info-row">
            <text class="label">性别比</text>
            <text class="value">{{ pokemon.gender_ratio === -1 ? '无性别' : (pokemon.gender_ratio / 8 * 100) + '% 雌性'
              }}</text>
          </view>
          <view class="info-row">
            <text class="label">基础经验</text>
            <text class="value">{{ pokemon.base_experience }}</text>
          </view>
          <view class="info-row" v-if="pokemon.flavor_text_zh">
            <text class="label">描述</text>
            <text class="value desc-text">{{ pokemon.flavor_text_zh }}</text>
          </view>
        </view>

        <!-- Base Stats Tab -->
        <view class="stats-list" v-if="activeTab === 'stats'">
          <view class="stat-row" v-for="(s, index) in pokemon.stats" :key="index">
            <text class="stat-label">{{ getStatName(s.stat.name) }}</text>
            <text class="stat-value">{{ s.base_stat }}</text>
            <view class="stat-bar-bg">
              <view class="stat-bar-fill"
                :style="{ width: (s.base_stat / 255 * 100) + '%', backgroundColor: getStatColor(s.stat.name) }" />
            </view>
          </view>
          <view class="stat-total">
            <text class="stat-label">总和</text>
            <text class="stat-value">{{ getTotalStats(pokemon.stats) }}</text>
            <view class="stat-bar-bg empty"></view>
          </view>
          <view class="stats-desc">
            <text>基础数值基于该种类的平均水平。</text>
          </view>
        </view>

        <!-- Evolution Tab -->
        <view class="evolution-list" v-if="activeTab === 'evolution'">
          <view v-if="pokemon.evolution_chains && pokemon.evolution_chains.length > 0">
            <view class="evo-tree">
              <view v-for="(stageNodes, stage) in groupedEvolution" :key="stage" class="evo-stage-group">
                <view class="evo-nodes">
                  <view v-for="(node, nIdx) in stageNodes" :key="nIdx" class="evo-node"
                    @click="goToPokemonById(node.id)">
                    <view class="evo-img-wrap">
                      <image class="evo-img" :src="`http://127.0.0.1:8000/media/pocket/pokemon/${node.id}.png`"
                        mode="aspectFit" />
                    </view>
                    <text class="evo-name">{{ node.name }}</text>
                    <view class="evo-condition" v-if="node.text">
                      <text>{{ node.text }}</text>
                    </view>
                    <text class="evo-stage-text">{{ node.stage }}</text>
                    <text class="evo-form" v-if="node.form_name">({{ node.form_name }})</text>
                  </view>
                </view>
                <view class="evo-divider" v-if="!isLastStage(stage)">
                  <text class="arrow-icon">↓</text>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="no-data">
            <text>暂无进化链数据</text>
          </view>
        </view>
      </view>

      <!-- Pokeball Catch Button -->
      <view class="catch-btn-container">
        <view class="catch-btn" @click="tryCatch" :class="{ 'catching': catching }">
          <view class="pokeball-top"></view>
          <view class="pokeball-bottom"></view>
          <view class="pokeball-center"></view>
        </view>
      </view>
    </view>

    <!-- Success Modal -->
    <view class="modal-overlay" v-if="catchSuccess">
      <view class="modal-card success-card animated-pop">
        <image class="close-icon" src="/static/icons/close-circle.svg" @click="catchSuccess = false" />
        <view class="success-glow"></view>
        <view class="confetti-icon">✨</view>
        <image class="modal-img" :src="pokemon.image" mode="aspectFit" />
        <text class="modal-title success-text">Gotcha!</text>
        <text class="modal-desc">{{ pokemon.name_zh }} was caught</text>

        <view class="input-section">
          <text class="input-label">Give a name for your pokemon</text>
          <input class="name-input" v-model="nickname" :placeholder="pokemon.name_zh" />
        </view>

        <button class="btn-primary success-btn" @click="confirmCatch">Register to Pokedex</button>
      </view>
    </view>

    <!-- Fail Modal -->
    <view class="modal-overlay" v-if="catchFail">
      <view class="modal-card fail-card animated-shake">
        <view class="fail-icon">💨</view>
        <text class="modal-title fail-text">Oh no!!!</text>
        <text class="modal-desc">{{ pokemon.name_zh }} has run away</text>
        <button class="btn-primary fail-btn" @click="catchFail = false">Close</button>
      </view>
    </view>

    <!-- Type Effectiveness Modal -->
    <view class="modal-overlay" v-if="showEffectModal" @click="showEffectModal = false">
      <view class="effect-modal" @click.stop>
        <view class="modal-header">
          <view class="modal-title-row">
            <text class="modal-title">{{ selectedType.name_zh }}</text>
            <text class="modal-subtitle">{{ selectedType.name_en }} / {{ selectedType.name_jp }}</text>
          </view>
          <text class="close-modal" @click="showEffectModal = false">✕</text>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <view class="effect-group" v-if="effectivenessData.strong.length">
            <text class="group-title strong">极佳 (x2)</text>
            <view class="type-grid">
              <TypeTag v-for="t in effectivenessData.strong" :key="t.name" :typeName="t.name" :typeZh="t.zh" size="small" />
            </view>
          </view>
          
          <view class="effect-group" v-if="effectivenessData.weak.length">
            <text class="group-title weak">较差 (x0.5)</text>
            <view class="type-grid">
              <TypeTag v-for="t in effectivenessData.weak" :key="t.name" :typeName="t.name" :typeZh="t.zh" size="small" />
            </view>
          </view>
          
          <view class="effect-group" v-if="effectivenessData.none.length">
            <text class="group-title none">无效 (x0)</text>
            <view class="type-grid">
              <TypeTag v-for="t in effectivenessData.none" :key="t.name" :typeName="t.name" :typeZh="t.zh" size="small" />
            </view>
          </view>

          <view class="modal-footer">
            <button class="filter-btn" @click="handleTypeSearch">筛选此属性</button>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CustomNavBar from '@/components/CustomNavBar.vue'
import TypeTag from '@/components/TypeTag.vue'
import { getPokemonDetail, catchPokemon, updatePlayerPokemon } from '@/api/pocket'
import { useSearchStore } from '@/store/search'

const searchStore = useSearchStore()

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const pokemon = ref(null)
const catching = ref(false)
const catchSuccess = ref(false)
const catchFail = ref(false)
const loading = ref(false)
const activeTab = ref('about')
const nickname = ref('')
const lastCaughtId = ref(null)

// Effectiveness Modal
const showEffectModal = ref(false)
const selectedType = ref(null)
const effectivenessData = computed(() => {
  if (!selectedType.value) return { strong: [], weak: [], none: [] }
  
  const eff = selectedType.value.effectiveness || {}
  const strong = [], weak = [], none = []
  
  for (const [tName, multiplier] of Object.entries(eff)) {
    const tInfo = searchStore.availableTypes.find(t => t.name_en.toLowerCase() === tName.toLowerCase()) || { name: tName.toLowerCase(), zh: tName }
    const data = { name: tInfo.name, zh: tInfo.name_zh || tName }
    
    if (multiplier === 2) strong.push(data)
    else if (multiplier === 0.5) weak.push(data)
    else if (multiplier === 0) none.push(data)
  }
  
  return { strong, weak, none }
})

const groupedEvolution = computed(() => {
  if (!pokemon.value || !pokemon.value.evolution_chains) return {}
  const groups = {}
  pokemon.value.evolution_chains.forEach(chain => {
    chain.forEach(node => {
      const stage = node.stage || '未知'
      if (!groups[stage]) groups[stage] = []
      // Check if already in group
      if (!groups[stage].find(n => n.name === node.name)) {
        const idMatch = node.image ? node.image.match(/^(\d+)/) : null
        const id = idMatch ? idMatch[1].padStart(4, '0') : null
        groups[stage].push({ ...node, id, text: node.text })
      }
    })
  })
  return groups
})

const isLastStage = (stage) => {
  const keys = Object.keys(groupedEvolution.value)
  return keys.indexOf(stage) === keys.length - 1
}

const goToPokemonById = (id) => {
  if (id) {
    uni.navigateTo({ url: `/pages/detail/index?id=${id}` })
  }
}

const showTypeEffectiveness = (type) => {
  // Find full type info from store (including effectiveness and other names)
  const fullType = searchStore.availableTypes.find(t => t.name_zh === type.name_zh)
  if (fullType) {
    selectedType.value = fullType
    showEffectModal.value = true
  }
}

const handleTypeSearch = () => {
  if (selectedType.value) {
    searchStore.setFilterType(selectedType.value.name_zh)
    searchStore.filterHabitat = ''
    uni.switchTab({ url: '/pages/home/index' })
  }
}

const handleHabitatClick = (name) => {
  searchStore.setFilterHabitat(name)
  searchStore.filterType = '' // Clear type filter for clarity
  uni.switchTab({ url: '/pages/home/index' })
}

const getStatName = (name) => {
  const map = {
    'hp': '生命',
    'attack': '攻击',
    'defense': '防御',
    'special-attack': '特攻',
    'special-defense': '特防',
    'speed': '速度'
  }
  return map[name] || name
}

const getStatColor = (name) => {
  const map = {
    'hp': '#FF4757',
    'attack': '#FFA502',
    'defense': '#2ED573',
    'special-attack': '#1E90FF',
    'special-defense': '#747D8C',
    'speed': '#A4B0BE'
  }
  return map[name] || '#ddd'
}

const getTotalStats = (stats) => {
  if (!stats) return 0
  return stats.reduce((sum, s) => sum + s.base_stat, 0)
}

onLoad(async (options) => {
  if (options.id) {
    loading.value = true
    try {
      pokemon.value = await getPokemonDetail(options.id)
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }
})

const tryCatch = async () => {
  if (catching.value) return
  catching.value = true

  try {
    const res = await catchPokemon(pokemon.value.id)
    if (res.success) {
      catchSuccess.value = true
      lastCaughtId.value = res.data.id
      nickname.value = pokemon.value.name_zh
    } else {
      catchFail.value = true
    }
  } catch (err) {
    if (err.data && err.data.error) {
      uni.showToast({ title: err.data.error, icon: 'none' })
    }
  } finally {
    catching.value = false
  }
}

const confirmCatch = async () => {
  if (nickname.value && lastCaughtId.value) {
    try {
      await updatePlayerPokemon(lastCaughtId.value, { nickname: nickname.value })
    } catch (err) {
      console.error('Failed to update nickname', err)
    }
  }
  catchSuccess.value = false
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-info {
  padding: 20px 30px;
}

.pokemon-name {
  font-size: 32px;
  font-weight: 800;
  color: $color-text-primary;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.types {
  display: flex;
  gap: 10px;
}

.type-tag {
  background-color: $color-secondary;
  color: $color-white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.pokemon-id {
  font-size: 18px;
  font-weight: 800;
  color: white;
  opacity: 0.8;
}

.bonus-tag {
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 8px;
  align-self: flex-start;
  text {
    font-size: 12px;
    color: white;
    font-weight: bold;
  }
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  z-index: 10;
  position: relative;
}

.main-img {
  width: 200px;
  height: 200px;
}

.bottom-sheet {
  flex: 1;
  background-color: $color-white;
  border-radius: 40px 40px 0 0;
  padding: 30px;
  position: relative;
  z-index: 5;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.02);
}

.tabs {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tab {
  font-size: 16px;
  color: $color-text-light;
  font-weight: bold;

  &.active {
    color: $color-text-primary;
    border-bottom: 2px solid $color-text-primary;
    padding-bottom: 8px;
    margin-bottom: -11px;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
}

.label {
  width: 100px;
  color: $color-text-secondary;
  font-size: 14px;
}

.value {
  flex: 1;
  font-size: 14px;
  color: $color-text-primary;
  font-weight: 500;
  
  &.link {
    color: $color-primary;
    text-decoration: underline;
  }
}

.value-col {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.value-item {
  color: $color-text-primary;
  font-size: 14px;
  font-weight: bold;
}

.desc-text {
  font-weight: normal;
  line-height: 1.5;
}

.section-subtitle {
  font-size: 16px;
  font-weight: bold;
  color: $color-text-primary;
  margin-top: 10px;
  margin-bottom: 5px;
}

/* Stats Styles */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-label {
  width: 50px;
  font-size: 13px;
  color: $color-text-secondary;
}

.stat-value {
  width: 35px;
  font-size: 14px;
  font-weight: bold;
  color: $color-text-primary;
  text-align: right;
}

.stat-bar-bg {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;

  &.empty {
    background-color: transparent;
  }
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stat-total {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  border-top: 1px dashed #eee;
  padding-top: 10px;
}

.stats-desc {
  margin-top: 20px;
  font-size: 12px;
  color: $color-text-light;
  text-align: center;
}

/* Evolution Styles */
.evolution-list {
  padding-bottom: 40px;
}

.evo-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.evo-stage-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.evo-nodes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.evo-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  width: 130px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 240, 0.5) 100%);
  border-radius: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(0, 0, 0, 0.02);

  &:active {
    transform: scale(0.92);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }
}

.evo-img-wrap {
  width: 70px;
  height: 70px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.evo-img {
  width: 100%;
  height: 100%;
}

.evo-name {
  font-size: 14px;
  font-weight: bold;
  color: $color-text-primary;
}

.evo-condition {
  margin-top: 4px;
  background-color: rgba($color-primary, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  
  text {
    font-size: 10px;
    color: $color-primary;
    white-space: normal;
    text-align: center;
  }
}

.evo-stage-text {
  font-size: 11px;
  color: $color-text-secondary;
  margin-top: 2px;
}

.evo-form {
  font-size: 10px;
  color: $color-primary;
  margin-top: 2px;
}

.evo-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.arrow-icon {
  font-size: 24px;
  color: #ddd;
  font-weight: 200;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: $color-text-light;
}

/* Modals Refined */
.success-card {
  background: linear-gradient(180deg, #FFFFFF 0%, #F0FFF4 100%);
  border: none;
}

.success-glow {
  position: absolute;
  top: -20px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(72, 187, 120, 0.2) 0%, transparent 70%);
  z-index: -1;
}

.confetti-icon {
  font-size: 40px;
  position: absolute;
  top: 20px;
  right: 20px;
}

.close-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 24px;
  height: 24px;
  opacity: 0.4;
  z-index: 10;
}

.success-text {
  color: #2F855A;
}

.success-btn {
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
}

.fail-card {
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 100%);
  border: none;
}

.fail-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.fail-text {
  color: #C53030;
}

.fail-btn {
  background: #A0AEC0;
  box-shadow: 0 8px 20px rgba(160, 174, 192, 0.2);
}

.input-section {
  width: 100%;
  margin-bottom: 20px;
}

/* Animations */
.animated-pop {
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animated-shake {
  animation: shake-modal 0.5s ease-in-out;
}

@keyframes shake-modal {

  0%,
  100% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-10px);
  }

  40%,
  80% {
    transform: translateX(10px);
  }
}

/* Pokeball Button */
.catch-btn-container {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

.catch-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  border: 3px solid #333;
  transition: transform 0.2s;

  &.catching {
    animation: shake 0.5s infinite;
  }
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(15deg);
  }

  50% {
    transform: rotate(0deg);
  }

  75% {
    transform: rotate(-15deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

.pokeball-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #FF4757;
  border-bottom: 3px solid #333;
}

.pokeball-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: white;
}

.pokeball-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  border: 3px solid #333;
  z-index: 2;
  box-shadow: inset 0 0 0 2px white, inset 0 0 0 4px #eee;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  background: white;
  width: 80%;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  // box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-img {
  width: 120px;
  height: 120px;
  margin-top: -60px;
  margin-bottom: 20px;
}

.smoke-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.modal-title {
  font-size: 28px;
  font-weight: 800;
  color: $color-text-primary;
  margin-bottom: 5px;
}

.modal-desc {
  font-size: 14px;
  color: $color-text-primary;
  font-weight: bold;
  margin-bottom: 25px;
}

.input-label {
  font-size: 11px;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
  margin-bottom: 10px;
  display: block;
}

.name-input {
  width: 100%;
  border: 1px solid #eee;
  background-color: #f9f9f9;
  border-radius: 15px;
  padding: 15px 20px;
  font-size: 16px;
  height: 56px;
  margin-bottom: 25px;
  box-sizing: border-box;
  color: $color-text-primary;
  font-weight: bold;
}

.btn-primary {
  background-color: $color-primary;
  color: white;
  border-radius: 25px;
  width: 100%;
  font-weight: bold;
  border: none;
  height: 50px;
  line-height: 50px;
}
</style>
