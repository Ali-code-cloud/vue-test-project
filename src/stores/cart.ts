import { defineStore } from 'pinia'

export interface ServiceItem {
  id: number
  category_id?: number
  name: string
  slug?: string
  short_description?: string | null
  original_price: string | number
  discounted_price: string | number
  unit?: string | null
  rating?: string | number
  image?: string | null
}

export interface CartEntry {
  service: ServiceItem
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    itemsMap: {} as Record<number, CartEntry>,
    selectedDateNum: 18,
    selectedTimeSlot: '09:00 AM',
    selectedAddress: 'Suite 402, Block H-3, Johar Town, Lahore',
    problemMessage: '',
    uploadedPreview: null as string | null,
    
    // Auth & Modal States (Matching Screenshots 1 & 2)
    showAuthModal: false,
    authModalStep: 'welcome' as 'welcome' | 'otp' | 'register', // 'welcome', 'otp', or 'register'
    userPhoneNumber: '',
    otpDigits: ['', '', '', '', '', ''],
    
    // Order Success Modal State
    showSuccessModal: false,
    
    // Animation trigger for bottom floating button
    buttonJustAnimated: false
  }),

  getters: {
    cartItemsList(state): CartEntry[] {
      return Object.values(state.itemsMap).filter(entry => entry.quantity > 0)
    },
    totalCartCount(state): number {
      return Object.values(state.itemsMap).reduce((sum, entry) => sum + entry.quantity, 0)
    },
    totalCartPrice(state): number {
      return Object.values(state.itemsMap).reduce((sum, entry) => {
        const price = Math.round(Number(entry.service.discounted_price || 0))
        return sum + (price * entry.quantity)
      }, 0)
    }
  },

  actions: {
    addToCart(service: ServiceItem) {
      const existing = this.itemsMap[service.id]
      if (existing) {
        existing.quantity += 1
      } else {
        this.itemsMap[service.id] = {
          service: { ...service },
          quantity: 1
        }
      }
      this.triggerButtonAnimation()
    },

    decrementFromCart(serviceId: number) {
      const existing = this.itemsMap[serviceId]
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1
        } else {
          delete this.itemsMap[serviceId]
        }
        this.triggerButtonAnimation()
      }
    },

    getServiceQuantity(serviceId: number): number {
      return this.itemsMap[serviceId]?.quantity || 0
    },

    triggerButtonAnimation() {
      this.buttonJustAnimated = true
      setTimeout(() => {
        this.buttonJustAnimated = false
      }, 600)
    },

    clearCart() {
      this.itemsMap = {}
      this.problemMessage = ''
      this.uploadedPreview = null
    },

    // Auth Modals
    openAuthModal() {
      this.authModalStep = 'welcome'
      this.showAuthModal = true
    },

    proceedToOtp(phone: string) {
      this.userPhoneNumber = phone || '03154867353'
      this.authModalStep = 'otp'
    },

    closeAuthModal() {
      this.showAuthModal = false
    }
  }
})
