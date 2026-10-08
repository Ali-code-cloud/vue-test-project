import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { toIsoDate } from '@/utils/date'

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM'
]

/** How many days ahead customers can book, starting today */
const DAYS_AHEAD = 14
/** A slot today must start at least this long from now */
const LEAD_MINUTES = 60

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1)
}

/** "09:30 AM" -> minutes after midnight */
function slotMinutes(slot: string): number {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = Number(match[1]) % 12
  if (match[3]!.toUpperCase() === 'PM') hours += 12
  return hours * 60 + Number(match[2])
}

/** "2026-10-07" -> "Wed, 7 October 2026" */
export function formatBookingDate(iso: string): string {
  if (!iso) return ''
  const d = parseIsoDate(iso)
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Date strip + time slots for booking, built from today's date.
 * Keeps cartStore.selectedDate / selectedTimeSlot on a slot that can still be booked.
 */
export function useBookingSlots() {
  const cartStore = useCartStore()
  const now = ref(new Date())

  // Re-check every minute so slots that pass while the page is open get disabled
  let timer: number | undefined
  onMounted(() => {
    timer = window.setInterval(() => { now.value = new Date() }, 60000)
  })
  onUnmounted(() => window.clearInterval(timer))

  const todayIso = computed(() => toIsoDate(now.value))

  const calendarDays = computed(() => {
    const start = new Date(now.value.getFullYear(), now.value.getMonth(), now.value.getDate())
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return { iso: toIsoDate(d), dateNum: d.getDate(), dayName: i === 0 ? 'Today' : DAY_NAMES[d.getDay()]! }
    })
  })

  function isSlotPast(iso: string, slot: string): boolean {
    if (iso !== todayIso.value) return iso < todayIso.value
    const nowMinutes = now.value.getHours() * 60 + now.value.getMinutes()
    return slotMinutes(slot) < nowMinutes + LEAD_MINUTES
  }

  function hasOpenSlot(iso: string): boolean {
    return TIME_SLOTS.some(slot => !isSlotPast(iso, slot))
  }

  /** Move the selection to the first bookable day/slot if it is missing or already passed */
  function ensureValidSelection() {
    const days = calendarDays.value
    if (!days.some(d => d.iso === cartStore.selectedDate) || !hasOpenSlot(cartStore.selectedDate)) {
      cartStore.selectedDate = days.find(d => hasOpenSlot(d.iso))?.iso || days[0]!.iso
    }
    if (!TIME_SLOTS.includes(cartStore.selectedTimeSlot) || isSlotPast(cartStore.selectedDate, cartStore.selectedTimeSlot)) {
      cartStore.selectedTimeSlot = TIME_SLOTS.find(slot => !isSlotPast(cartStore.selectedDate, slot)) || TIME_SLOTS[0]!
    }
  }

  function selectDate(iso: string) {
    cartStore.selectedDate = iso
    ensureValidSelection()
  }

  /** "October, 2026" for the selected day */
  const monthLabel = computed(() => {
    const d = parseIsoDate(cartStore.selectedDate || todayIso.value)
    return `${MONTH_NAMES[d.getMonth()]}, ${d.getFullYear()}`
  })

  ensureValidSelection()

  return {
    calendarDays,
    timeSlots: TIME_SLOTS,
    monthLabel,
    isSlotPast,
    hasOpenSlot,
    selectDate,
    ensureValidSelection
  }
}
