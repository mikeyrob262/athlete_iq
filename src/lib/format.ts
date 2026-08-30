export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatDistance(meters: number | null): string {
  if (meters == null) return '-'
  const km = meters / 1000
  return `${km.toFixed(1)} km`
}

export function formatElevation(meters: number | null): string {
  if (meters == null) return '-'
  return `${Math.round(meters)} m`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatPace(seconds: number, meters: number | null): string {
  if (!meters || meters === 0) return '-'
  const km = meters / 1000
  const secPerKm = seconds / km
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}
