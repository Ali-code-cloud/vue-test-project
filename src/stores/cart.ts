import { defineStore } from 'pinia'
import api from '@/composables/useApi'
import { showSuccessToast, showInfoToast, showErrorToast, showConfirmAlert } from '@/utils/alert'
import { toIsoDate } from '@/utils/date'
import { useAuthStore } from '@/stores/auth'

/** The backend accepts 1 to 20 of each service per order */
export const MAX_QUANTITY = 20

/** Checkout failure; `fields` holds the backend's per-field messages (address, customer_phone, latitude, ...) */
export class CheckoutError extends Error {
  fields: Record<string, string>
  constructor(message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'CheckoutError'
    this.fields = fields
  }
}

/** Builds a CheckoutError from a checkout error body: { message, errors: { field: [msg] } } */
function checkoutErrorFrom(body: any): CheckoutError {
  const fields: Record<string, string> = {}
  for (const [key, value] of Object.entries(body?.errors || {})) {
    const msg = Array.isArray(value) ? value[0] : value
    if (msg) fields[key] = String(msg)
  }
  // Laravel adds "(and 1 more error)"; generic messages like "Validation failed" are replaced by the field messages
  const generic = !body?.message || /^validation failed\.?$/i.test(body.message) || /given data was invalid/i.test(body.message)
  const message = generic && Object.keys(fields).length
    ? [...new Set(Object.values(fields))].join(' ')
    : String(body?.message || 'Failed to place order. Please try again.').replace(/\s*\(and \d+ more errors?\)$/, '')
  return new CheckoutError(message, fields)
}

export interface ServiceItem {
  id: number
  category_id?: number
  name: string
  slug?: string
  short_description?: string | null
  description?: string | null
  original_price: string | number
  discounted_price: string | number
  unit?: string | null
  rating?: string | number
  review_count?: number
  image?: string | null
}

/** Customer's location for the order; source is 'live' (GPS) or 'manual' (map pin) */
export interface OrderLocation {
  latitude: number
  longitude: number
  source: 'live' | 'manual'
}

export const LOCATION_REQUIRED = 'Location is required. Please share your live location or pin your address on the map.'

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
    // Booking day as YYYY-MM-DD; useBookingSlots() keeps it on a day/slot that can still be booked
    selectedDate: '',
    selectedTimeSlot: '09:00 AM',
    // Service location (checkout): house/flat/street text + optional city and town
    selectedAddress: '',
    selectedCity: '',
    selectedTown: '',
    locationMode: 'live' as 'live' | 'manual',
    addressError: '',
    problemMessage: '',
    // Required at checkout: live GPS or a pin dropped on the map
    orderLocation: null as OrderLocation | null,
    locationError: '',
    uploadedPreview: null as string | null,
    
    // Auth & Modal States
    showAuthModal: false,
    authModalStep: 'welcome' as 'welcome' | 'otp' | 'register' | 'login',
    userPhoneNumber: '',
    otpDigits: ['', '', '', '', '', ''],
    
    // Order Success Modal State
    showSuccessModal: false,
    lastOrder: null as any,
    
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
      const newQty = Math.min(existing ? existing.quantity + addedQty : addedQty, MAX_QUANTITY)

      if (existing && existing.quantity >= MAX_QUANTITY) {
        showInfoToast(`You can book up to ${MAX_QUANTITY} of one service per order.`)
        return
      }

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

      if (quantity > MAX_QUANTITY) {
        showInfoToast(`You can book up to ${MAX_QUANTITY} of one service per order.`)
        quantity = MAX_QUANTITY
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
      latitude: number
      longitude: number
      location_source: 'live' | 'manual'
    }>) {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')

      // Pre-check 1: Authenticated user required
      if (!token || !user) {
        this.openAuthModal()
        throw new Error('Unauthenticated: Please log in to place an order.')
      }

      // Pre-check 2: Address validation
      // The address typed on the checkout page wins over the one saved on the profile
      const finalAddress = (orderData?.address || this.selectedAddress || user?.address || '').trim()
      if (!finalAddress) {
        const msg = 'Address field is required. Please fill in your address to place an order.'
        throw new CheckoutError(msg, { address: msg })
      }

      // Pre-check 3: Phone number validation
      const finalPhone = (orderData?.customer_phone || user?.phone || this.userPhoneNumber || '').trim()
      if (!finalPhone) {
        const msg = 'Phone number is required. Please confirm your phone number before placing an order.'
        throw new CheckoutError(msg, { customer_phone: msg })
      }

      // Pre-check 4: Location (live GPS or map pin) is required by the backend
      const location = this.locationPayload(orderData)
      if (!location) {
        this.locationError = LOCATION_REQUIRED
        throw new CheckoutError(LOCATION_REQUIRED, { latitude: LOCATION_REQUIRED })
      }

      // Pre-check 5: At least one item selected
      if (this.cartItemsList.length === 0) {
        throw new CheckoutError('Cannot place order: Please select at least one service to order.')
      }

      const itemsArray = this.cartItemsList.map(item => ({
        service_id: Number(item.service.id),
        quantity: Math.min(Number(item.quantity), MAX_QUANTITY)
      }))

      // items[] covers one or several services (the backend ignores service_id/quantity when items is sent)
      const payload = {
        items: itemsArray,
        customer_name: orderData?.customer_name || user?.name || 'Customer',
        // Accounts are phone-only; send an email only when the account has one
        customer_email: orderData?.customer_email || user?.email || null,
        customer_phone: finalPhone,
        address: finalAddress,
        city: (orderData?.city || this.selectedCity).trim() || null,
        town: (orderData?.town || this.selectedTown).trim() || null,
        booking_date: orderData?.booking_date || this.selectedDate || toIsoDate(new Date()),
        booking_time_slot: orderData?.booking_time_slot || this.selectedTimeSlot || '10:00 AM - 12:00 PM',
        notes: orderData?.notes || this.problemMessage || '',
        ...location
      }

      let resData: any = null
      try {
        // skipAuthRedirect: a 401 here is handled below without reloading the page (which would empty the cart)
        const { data } = await api.post('/api/orders/checkout', payload, { skipAuthRedirect: true } as any)
        resData = data
      } catch (err: any) {
        if (err?.response) {
          // 401: token missing or expired. Sign in again; the cart stays as it is
          if (err.response.status === 401) {
            useAuthStore().logout()
            this.openAuthModal()
            throw new CheckoutError('Your session has expired. Please sign in again to place your order.')
          }
          throw checkoutErrorFrom(err.response.data)
        }
        // Timed out: the order may already have been saved, so it must not be sent again
        if (err?.code === 'ECONNABORTED') {
          throw new CheckoutError('The server took too long to answer. Please check My Orders in your dashboard before trying again.')
        }
        // Server not reachable at all (nothing was received): try the other local backend address once
        const res = await fetch('http://mrhomeservices.test:8001/api/orders/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }).catch(() => {
          throw new CheckoutError('Could not reach the server. Please check your internet connection and try again.')
        })
        resData = await res.json().catch(() => null)
        if (!res.ok || !resData?.status) throw checkoutErrorFrom(resData)
      }

      if (resData?.status) {
        this.lastOrder = resData?.data || null
        this.itemsMap = {}
        this.orderLocation = null
        this.problemMessage = ''
        this.uploadedPreview = null
        this.showSuccessModal = true
      }
      return resData
    },

    /** latitude/longitude/location_source for POST /api/orders/checkout; null when there is no location yet */
    locationPayload(orderData?: { latitude?: number; longitude?: number; location_source?: 'live' | 'manual' }) {
      if (orderData?.latitude != null && orderData?.longitude != null) {
        return {
          latitude: orderData.latitude,
          longitude: orderData.longitude,
          location_source: orderData.location_source || 'live'
        }
      }
      if (this.orderLocation) {
        const { latitude, longitude, source } = this.orderLocation
        return { latitude, longitude, location_source: source }
      }
      return null
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
