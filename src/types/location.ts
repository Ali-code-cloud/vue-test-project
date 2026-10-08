export type LngLat = [longitude: number, latitude: number]
export interface DeliveryLocation {
  address: string
  latitude: number | null
  longitude: number | null
}
