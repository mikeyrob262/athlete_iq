export interface Athlete {
  id: string
  first_name: string
  last_name: string
  ftp: number | null
  weight_kg: number | null
  created_at: string
}

export interface Gear {
  id: string
  athlete_id: string
  type: 'bike' | 'shoe' | 'wheelset' | 'power_meter'
  name: string
  manufacturer: string | null
  model: string | null
  purchase_date: string | null
  current_mileage_km: number
  created_at: string
}

export interface Session {
  id: string
  athlete_id: string
  type: 'ride' | 'run' | 'walk' | 'strength' | 'swim' | 'race'
  started_at: string
  duration_seconds: number
  distance_meters: number | null
  elevation_gain_meters: number | null
  avg_heart_rate: number | null
  avg_power: number | null
  gear_id: string | null
  created_at: string
}

export type AthleteInsert = Omit<Athlete, 'id' | 'created_at'>
export type SessionInsert = Omit<Session, 'id' | 'created_at'>
export type GearInsert = Omit<Gear, 'id' | 'created_at' | 'current_mileage_km'>
