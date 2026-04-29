import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    // Filter states
    filterType: '',
    filterHabitat: '',
    
    // Environment states
    currentWeather: 'Clear', // Clear, Rain, Sun, Sandstorm
    currentLocation: 'Grassland', // Grassland, Cave, Sea, Forest
    
    // Metadata for filters
    availableTypes: [],
    availableHabitats: []
  }),
  
  getters: {
    // Calculate capture bonus based on environment and pokemon properties
    // Returns a multiplier or a percentage increase
    getCaptureBonus: (state) => (pokemon) => {
      if (!pokemon) return 0
      
      let bonus = 0
      
      // 1. Weather Bonuses
      const types = pokemon.types_detail ? pokemon.types_detail.map(t => t.name) : []
      
      if (state.currentWeather === 'Rain') {
        if (types.includes('water')) bonus += 20
        if (types.includes('fire')) bonus -= 10
      } else if (state.currentWeather === 'Sun') {
        if (types.includes('fire')) bonus += 20
        if (types.includes('water')) bonus -= 10
      } else if (state.currentWeather === 'Sandstorm') {
        if (types.includes('rock') || types.includes('ground') || types.includes('steel')) bonus += 15
      }
      
      // 2. Location (Habitat) Bonuses
      // If current simulated location matches pokemon's natural habitat, bonus!
      if (pokemon.habitat_name === state.currentLocation || pokemon.habitat === state.currentLocation) {
        bonus += 10
      }
      
      return bonus
    }
  },
  
  actions: {
    setFilterType(type) {
      this.filterType = this.filterType === type ? '' : type
    },
    setFilterHabitat(habitat) {
      this.filterHabitat = this.filterHabitat === habitat ? '' : habitat
    },
    resetFilters() {
      this.filterType = ''
      this.filterHabitat = ''
    },
    setMetadata(types, habitats) {
      this.availableTypes = types
      this.availableHabitats = habitats
    },
    updateEnvironment(weather, location) {
      this.currentWeather = weather || this.currentWeather
      this.currentLocation = location || this.currentLocation
    }
  }
})
