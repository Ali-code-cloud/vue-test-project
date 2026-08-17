export interface ServiceCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  image?: string | null
  display_order?: number
  is_active?: boolean
  is_featured?: boolean
}

export interface ServiceItem {
  id: number
  category_id: number
  name: string
  slug: string
  description?: string | null
  short_description?: string | null
  original_price: string | number
  discounted_price: string | number
  unit?: string | null
  rating?: string | number
  review_count?: number
  service_type?: string | null
  image?: string | null
  features?: string | null
  display_order?: number
  is_active?: boolean
  is_featured?: boolean
  is_popular?: boolean
}

const API_BASE_URL = 'http://127.0.0.1:8001/api'
export const STORAGE_BASE_URL = 'http://127.0.0.1:8001/storage'

// Helper to format image URL correctly
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80'
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // Remove leading slash if any
  const cleanPath = imagePath.replace(/^\//, '')
  return `http://127.0.0.1:8001/storage/${cleanPath}`
}

// Mock fallback categories matching the user API structure
const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 4,
    name: 'AC',
    slug: 'ac',
    description: 'This category belongs to all ac services, repair and installation',
    icon: null,
    image: 'images/services/category/1785783546_ac.jpeg',
    display_order: 0,
    is_active: true,
    is_featured: true
  },
  {
    id: 5,
    name: 'Quinn Mckay',
    slug: 'quinn-mckay',
    description: 'Deserunt iste quis l',
    icon: null,
    image: 'images/services/category/1786388412_quinn-mckay.png',
    display_order: 0,
    is_active: true,
    is_featured: true
  },
  {
    id: 6,
    name: 'Plumbing Services',
    slug: 'plumbing-services',
    description: 'Professional leak repair, pipe fitting and sanitary work',
    icon: null,
    image: null,
    display_order: 1,
    is_active: true,
    is_featured: true
  },
  {
    id: 7,
    name: 'Electrical Work',
    slug: 'electrical-work',
    description: 'Expert electrician for wiring, breaker and appliance fixes',
    icon: null,
    image: null,
    display_order: 2,
    is_active: true,
    is_featured: true
  }
]

// Mock fallback services matching the user API structure
const MOCK_SERVICES: Record<number, ServiceItem[]> = {
  4: [
    {
      id: 101,
      category_id: 4,
      name: 'AC General Service',
      slug: 'ac-general-service',
      description: 'Complete master cleaning and deep service for split & window AC',
      short_description: '- Per AC (0 to 2.5 tons)',
      original_price: '3000.00',
      discounted_price: '2250.00',
      unit: 'Per AC',
      rating: '4.3',
      review_count: 142,
      service_type: 'AC Maintenance',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
      features: null,
      display_order: 0,
      is_active: true,
      is_featured: true,
      is_popular: true
    },
    {
      id: 102,
      category_id: 4,
      name: 'AC Installation',
      slug: 'ac-installation',
      description: 'Professional wall mounting & outdoor unit installation',
      short_description: '- Installation with 10 Feet pipe (1 to 2.5 tons)',
      original_price: '2500.00',
      discounted_price: '2000.00',
      unit: 'Per Unit',
      rating: '4.4',
      review_count: 98,
      service_type: 'AC Installation',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400&auto=format&fit=crop&q=80',
      features: null,
      display_order: 1,
      is_active: true,
      is_featured: true,
      is_popular: true
    },
    {
      id: 103,
      category_id: 4,
      name: 'AC Repairing',
      slug: 'ac-repairing',
      description: 'Diagnostic inspection, PCB repair and compressor checkup',
      short_description: '- Visit and Inspection Charges',
      original_price: '1000.00',
      discounted_price: '500.00',
      unit: 'Per Visit',
      rating: '4.5',
      review_count: 210,
      service_type: 'AC Repair',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80',
      features: null,
      display_order: 2,
      is_active: true,
      is_featured: true,
      is_popular: false
    },
    {
      id: 104,
      category_id: 4,
      name: 'AC Mounting and Dismounting',
      slug: 'ac-mounting-and-dismounting',
      description: 'Shift your AC unit safely with proper gas lock and mounting',
      short_description: '- Per AC (0 to 2.5 tons)',
      original_price: '3500.00',
      discounted_price: '3000.00',
      unit: 'Per AC',
      rating: '4.6',
      review_count: 64,
      service_type: 'AC Shifting',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
      features: null,
      display_order: 3,
      is_active: true,
      is_featured: true,
      is_popular: false
    },
    {
      id: 105,
      category_id: 4,
      name: 'AC Dismounting',
      slug: 'ac-dismounting',
      description: 'Safe removal of indoor and outdoor AC units',
      short_description: '- Per AC (0 to 2.5 tons)',
      original_price: '1500.00',
      discounted_price: '1200.00',
      unit: 'Per AC',
      rating: '4.5',
      review_count: 38,
      service_type: 'AC Shifting',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400&auto=format&fit=crop&q=80',
      features: null,
      display_order: 4,
      is_active: true,
      is_featured: false,
      is_popular: false
    },
    {
      id: 106,
      category_id: 4,
      name: 'AC Mounting and Dismounting + AC General Service',
      slug: 'ac-mounting-dismounting-general-service',
      description: 'Combo package for shifting and deep servicing AC',
      short_description: '- Per AC (0 to 2.5 tons)',
      original_price: '6500.00',
      discounted_price: '5500.00',
      unit: 'Per AC Combo',
      rating: '4.8',
      review_count: 115,
      service_type: 'Combo Deal',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80',
      features: null,
      display_order: 5,
      is_active: true,
      is_featured: true,
      is_popular: true
    }
  ],
  5: [
    {
      id: 4,
      category_id: 5,
      name: 'Leah Griffin',
      slug: 'leah-griffin',
      description: 'Delectus quasi labo',
      short_description: 'Et voluptatem Susci',
      original_price: '998.00',
      discounted_price: '734.00',
      unit: 'Nulla dolores consec',
      rating: '0.0',
      review_count: 59,
      service_type: 'Veniam facilis fuga',
      image: 'images/services/1786388444_leah-griffin.png',
      features: null,
      display_order: 0,
      is_active: true,
      is_featured: true,
      is_popular: false
    }
  ]
}

// Fetch all service categories
export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(`${API_BASE_URL}/service-categories`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const data = await res.json()
    if (data && data.status && Array.isArray(data.data) && data.data.length > 0) {
      return data.data
    }
    return MOCK_CATEGORIES
  } catch (error) {
    console.warn('API fetchServiceCategories failed, using fallback mock data:', error)
    return MOCK_CATEGORIES
  }
}

// Fetch services by category ID
export async function fetchServicesByCategoryId(categoryId: number | string): Promise<ServiceItem[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(`${API_BASE_URL}/services/${categoryId}`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) throw new Error(`HTTP error ${res.status}`)
    const data = await res.json()
    if (data && data.status && Array.isArray(data.data) && data.data.length > 0) {
      return data.data
    }
    const numId = Number(categoryId)
    return MOCK_SERVICES[numId] || MOCK_SERVICES[4] || []
  } catch (error) {
    console.warn(`API fetchServicesByCategoryId (${categoryId}) failed, using fallback mock data:`, error)
    const numId = Number(categoryId)
    return MOCK_SERVICES[numId] || MOCK_SERVICES[4] || []
  }
}
