import { defineStore } from 'pinia'

export const useAllStore = defineStore('allStore', {
  state: () => {
    return {
      currentUrl: ''
    }
  },
  actions: {
    saveCurrentUrl(tmp) {
      this.currentUrl = tmp
    }
  },
  persist: true
})
