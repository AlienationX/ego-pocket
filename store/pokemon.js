import { defineStore } from 'pinia'

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    // Filter states
    filterType: '',
    filterHabitat: '',
    
    // Metadata for filters
    availableTypes: [],
    availableHabitats: [],

    // Data Caching
    cachedHomePokemon: [],
    cachedPokedex: [],

    // Persistence
    homeState: { currentPage: 1, hasMore: true, searchText: '' },
    pokedexState: { currentPage: 1, hasMore: true, searchText: '' }
  }),
  
  actions: {
    setFilterType(type) { this.filterType = this.filterType === type ? '' : type },
    setFilterHabitat(habitat) { this.filterHabitat = this.filterHabitat === habitat ? '' : habitat },
    resetFilters() { this.filterType = ''; this.filterHabitat = '' },
    setMetadata(types, habitats) { this.availableTypes = types; this.availableHabitats = habitats },
    setCachedHomePokemon(list) { this.cachedHomePokemon = list },
    setCachedPokedex(list) { this.cachedPokedex = list },
    updateHomeState(newState) { this.homeState = { ...this.homeState, ...newState } },
    updatePokedexState(newState) { this.pokedexState = { ...this.pokedexState, ...newState } }
  }
})
