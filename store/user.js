import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Data Caching
    cachedPlayerStats: null,
    cachedPlayerInfo: null,

    // Persistence
    profileState: {}
  }),
  
  actions: {
    setCachedPlayerStats(stats) { this.cachedPlayerStats = stats },
    setCachedPlayerInfo(info) { this.cachedPlayerInfo = info },
    updateProfileState(newState) { this.profileState = { ...this.profileState, ...newState } }
  }
})
