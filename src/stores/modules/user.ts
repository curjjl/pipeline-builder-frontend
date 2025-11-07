import { defineStore } from 'pinia'
import type { User } from '@/types'

interface UserState {
  currentUser: User | null
  token: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    token: null
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.token
    },

    username(): string {
      return this.currentUser?.username || 'Guest'
    }
  },

  actions: {
    setUser(user: User) {
      this.currentUser = user
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    logout() {
      this.currentUser = null
      this.token = null
      localStorage.removeItem('token')
    }
  },

  persist: {
    key: 'pipeline-builder-user',
    storage: localStorage,
    paths: ['token', 'currentUser']
  }
})
