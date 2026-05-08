import { defineStore } from 'pinia'

export const useExploreStore = defineStore('explore', {
  state: () => ({
    // Environment states
    currentWeather: 'Sunny', // Sunny, Rainy, Snowy, Cloudy
    currentLocation: 'Grassland', // Grassland, Cave, Sea, Forest
  }),
  
  getters: {
    getCaptureBonus: (state) => (pokemon) => {
      if (!pokemon) return 0
      let bonus = 0
      const types = pokemon.types_detail ? pokemon.types_detail.map(t => t.name_zh) : []
      
      // Matching backend logic
      if (state.currentWeather === 'Rainy') {
        if (types.includes('水') || types.includes('电') || types.includes('虫')) bonus += 10
      } else if (state.currentWeather === 'Sunny') {
        if (types.includes('火') || types.includes('草') || types.includes('地面')) bonus += 10
      } else if (state.currentWeather === 'Snowy') {
        if (types.includes('冰') || types.includes('钢')) bonus += 10
      } else if (state.currentWeather === 'Cloudy') {
        if (types.includes('一般') || types.includes('格斗') || types.includes('毒')) bonus += 10
      }
      
      return bonus
    }
  },
  
  actions: {
    updateEnvironment(weather, location) {
      this.currentWeather = weather || this.currentWeather
      this.currentLocation = location || this.currentLocation
    }
  }
})
