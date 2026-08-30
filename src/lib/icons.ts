import {
  Bike,
  Footprints,
  Dumbbell,
  Waves,
  Trophy,
  Activity,
  Gauge,
  Heart,
  Timer,
  Mountain,
  Zap,
  Watch,
  CircleDot,
  Bike as BikeIcon,
  Shirt,
} from 'lucide-react'
import type { Session, Gear } from './types'

export function getSessionIcon(type: Session['type']) {
  switch (type) {
    case 'ride':
      return Bike
    case 'run':
      return Footprints
    case 'walk':
      return Footprints
    case 'strength':
      return Dumbbell
    case 'swim':
      return Waves
    case 'race':
      return Trophy
  }
}

export function getSessionColor(type: Session['type']): { bg: string; color: string } {
  switch (type) {
    case 'ride':
      return { bg: 'rgba(10, 132, 255, 0.15)', color: '#3d9bff' }
    case 'run':
      return { bg: 'rgba(0, 212, 168, 0.15)', color: '#00d4a8' }
    case 'walk':
      return { bg: 'rgba(155, 166, 199, 0.15)', color: '#9aa6c7' }
    case 'strength':
      return { bg: 'rgba(255, 185, 70, 0.15)', color: '#ffb946' }
    case 'swim':
      return { bg: 'rgba(100, 180, 255, 0.15)', color: '#64b4ff' }
    case 'race':
      return { bg: 'rgba(255, 92, 92, 0.15)', color: '#ff5c5c' }
  }
}

export function getGearIcon(type: Gear['type']) {
  switch (type) {
    case 'bike':
      return BikeIcon
    case 'shoe':
      return Footprints
    case 'wheelset':
      return CircleDot
    case 'power_meter':
      return Gauge
  }
}

export function getGearColor(type: Gear['type']): { bg: string; color: string } {
  switch (type) {
    case 'bike':
      return { bg: 'rgba(10, 132, 255, 0.15)', color: '#3d9bff' }
    case 'shoe':
      return { bg: 'rgba(0, 212, 168, 0.15)', color: '#00d4a8' }
    case 'wheelset':
      return { bg: 'rgba(255, 185, 70, 0.15)', color: '#ffb946' }
    case 'power_meter':
      return { bg: 'rgba(255, 92, 92, 0.15)', color: '#ff5c5c' }
  }
}

export {
  Activity,
  Heart,
  Timer,
  Mountain,
  Zap,
  Watch,
  Footprints,
  Dumbbell,
  Waves,
  Trophy,
  Bike,
  Gauge,
  CircleDot,
  Shirt,
}
