import { defineStore } from 'pinia'
import api from '@/composables/useApi'
import { showSuccessToast, showInfoToast, showErrorToast, showConfirmAlert } from '@/utils/alert'

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
  cartItemId?: number
}

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('cart_session_id')
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('cart_session_id', sessionId)
  }
  return sessionId
}

function getAuthOrSessionPayload() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const sessionId = localStorage.getItem('cart_session_id')

  const payload: Record<string, any> = {}
  if (token && user?.id) {
    payload.user_id = user.id
  }
  if (sessionId) {
    payload.session_id = sessionId
  }
  return { token, user, sessionId, payload }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    itemsMap: {} as Record<number, CartEntry>,
    selectedDateNum: 18,
    selectedTimeSlot: '09:00 AM',
    selectedAddress: 'Suite 402, Block H-3, Johar Town, Lahore',
    problemMessage: '',
    uploadedPreview: null as string | null,
    
    // Auth & Modal States
    showAuthModal: false,
    authModalStep: 'welcome' as 'welcome' | 'otp' | 'register' | 'login',
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
    /** No-op for backwards compatibility */
    async fetchCart() {
      return
    },

    addToCart(service: ServiceItem, quantityToAdd: number = 1) {
      const existing = this.itemsMap[service.id]
      const addedQty = quantityToAdd || 1
      const newQty = existing ? existing.quantity + addedQty : addedQty

      if (existing) {
        existing.quantity = newQty
      } else {
        this.itemsMap[service.id] = {
          service: { ...service },
          quantity: newQty
        }
      }
      this.triggerButtonAnimation()
      showSuccessToast(`Added ${service.name} to cart!`)
    },

    async updateCartQuantity(serviceId: number, quantity: number) {
      const existing = this.itemsMap[serviceId]
      if (!existing) return

      if (quantity <= 0) {
        return await this.removeFromCartApi(serviceId)
      }

      existing.quantity = quantity
      this.triggerButtonAnimation()
    },

    async decrementFromCart(serviceId: number) {
      const existing = this.itemsMap[serviceId]
      if (!existing) return

      if (existing.quantity > 1) {
        this.updateCartQuantity(serviceId, existing.quantity - 1)
      } else {
        await this.removeFromCartApi(serviceId)
      }
      this.triggerButtonAnimation()
    },

    async removeFromCartApi(serviceId: number, skipConfirm = false) {
      const existing = this.itemsMap[serviceId]
      const name = existing?.service?.name || 'this service'

      if (!skipConfirm) {
        const confirmRes = await showConfirmAlert(
          'Remove Service?',
          `Are you sure you want to remove "${name}" from your cart?`,
          'Yes, Remove'
        )
        if (!confirmRes.isConfirmed) return
      }

      delete this.itemsMap[serviceId]
      this.triggerButtonAnimation()
      showInfoToast(`Removed "${name}" from cart`)
    },

    async clearCart(skipConfirm = false) {
      if (!skipConfirm && this.cartItemsList.length > 0) {
        const confirmRes = await showConfirmAlert(
          'Clear Cart?',
          'Are you sure you want to remove all items from your cart?',
          'Yes, Clear Cart'
        )
        if (!confirmRes.isConfirmed) return
      }

      this.itemsMap = {}
      this.problemMessage = ''
      this.uploadedPreview = null
      showInfoToast('Cart cleared')
    },

    /**
     * Standalone Order Placement (No Cart Dependency Required)
     * Enforces:
     *  - Auth token check
     *  - Address presence check
     *  - Phone presence check
     *  - Selected items presence check
     */
    async placeOrder(orderData?: Partial<{
      customer_name: string
      customer_email: string
      customer_phone: string
      address: string
      city: string
      town: string
      booking_date: string
      booking_time_slot: string
      notes: string
    }>) {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')

      // Pre-check 1: Authenticated user required
      if (!token || !user) {
        this.openAuthModal()
        throw new Error('Unauthenticated: Please log in to place an order.')
      }

      // Pre-check 2: Address validation
      const finalAddress = (orderData?.address || user?.address || this.selectedAddress || '').trim()
      if (!finalAddress) {
        throw new Error('Address field is required. Please fill in your address to place an order.')
      }

      // Pre-check 3: Phone number validation
      const finalPhone = (orderData?.customer_phone || user?.phone || this.userPhoneNumber || '').trim()
      if (!finalPhone) {
        throw new Error('Phone number is required. Please confirm your phone number before placing an order.')
      }

      // Pre-check 4: At least one item selected
      if (this.cartItemsList.length === 0) {
        throw new Error('Cannot place order: Please select at least one service to order.')
      }

      const itemsArray = this.cartItemsList.map(item => ({
        service_id: Number(item.service.id),
        quantity: Number(item.quantity)
      }))

      const payload = {
        items: itemsArray,
        service_id: itemsArray[0]?.service_id,
        quantity: itemsArray[0]?.quantity || 1,
        customer_name: orderData?.customer_name || user?.name || 'Customer',
        customer_email: orderData?.customer_email || user?.email || 'customer@example.com',
        customer_phone: finalPhone,
        address: finalAddress,
        city: orderData?.city || 'Lahore',
        town: orderData?.town || 'Johar Town',
        booking_date: orderData?.booking_date || `2026-09-${String(this.selectedDateNum).padStart(2, '0')}`,
        booking_time_slot: orderData?.booking_time_slot || this.selectedTimeSlot || '10:00 AM - 12:00 PM',
        notes: orderData?.notes || this.problemMessage || ''
      }

      let resData: any = null
      try {
        const { data } = await api.post('/api/orders/checkout', payload)
        resData = data
      } catch (err: any) {
        try {
          const res = await fetch('http://mrhomeservices.test:8001/api/orders/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          })
          resData = await res.json()
          if (!res.ok || !resData.status) {
            const errMsg = resData?.message || (resData?.errors ? Object.values(resData.errors).flat().join(', ') : 'Failed to place order.')
            throw new Error(errMsg)
          }
        } catch (fallbackErr: any) {
          if (err?.response?.data) {
            const d = err.response.data
            const msg = d.message || (d.errors ? Object.values(d.errors).flat().join(', ') : 'Failed to place order.')
            throw new Error(msg)
          }
          throw fallbackErr
        }
      }

      if (resData?.status) {
        this.itemsMap = {}
        this.problemMessage = ''
        this.uploadedPreview = null
        this.showSuccessModal = true
      }
      return resData
    },

    async checkoutOrder(orderData?: any) {
      return this.placeOrder(orderData)
    },

    /** Fetch all orders belonging to authenticated user */
    async fetchUserOrders() {
      const token = localStorage.getItem('token')
      if (!token) return []

      try {
        const { data } = await api.get('/api/user/orders')
        return data?.data || data || []
      } catch (e) {
        try {
          const res = await fetch('http://mrhomeservices.test:8001/api/user/orders', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
          const resData = await res.json()
          return resData?.data || resData || []
        } catch (err) {
          return []
        }
      }
    },

    /** Cancel an order */
    async cancelOrder(orderId: number | string, cancellationReason: string = 'Schedule change') {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Unauthenticated')

      const payload = { cancellation_reason: cancellationReason }
      try {
        const { data } = await api.post(`/api/orders/${orderId}/cancel`, payload)
        return data
      } catch (e) {
        const res = await fetch(`http://mrhomeservices.test:8001/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
        return await res.json()
      }
    },

    /** Delete an order */
    async deleteOrder(orderId: number | string) {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Unauthenticated')

      try {
        const { data } = await api.delete(`/api/user/orders/${orderId}`)
        return data
      } catch (e) {
        const res = await fetch(`http://mrhomeservices.test:8001/api/user/orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        return await res.json()
      }
    },

    syncCartFromApiResponse(cartObj: any) {
      const items = cartObj.items || (Array.isArray(cartObj) ? cartObj : [])
      if (!Array.isArray(items)) return

      const updatedMap: Record<number, CartEntry> = {}

      items.forEach((item: any) => {
        const serviceObj = item.service || {}
        const sId = Number(item.service_id || serviceObj.id)
        if (!sId) return

        const formattedService: ServiceItem = {
          id: sId,
          category_id: serviceObj.category_id,
          name: serviceObj.name || 'Service Item',
          slug: serviceObj.slug,
          short_description: serviceObj.short_description,
          original_price: serviceObj.original_price || item.unit_price || 0,
          discounted_price: serviceObj.discounted_price || item.unit_price || 0,
          unit: serviceObj.unit,
          rating: serviceObj.rating || '4.8',
          image: serviceObj.image
        }

        updatedMap[sId] = {
          service: formattedService,
          quantity: Number(item.quantity || 1),
          cartItemId: item.id ? Number(item.id) : undefined
        }
      })

      this.itemsMap = updatedMap
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
