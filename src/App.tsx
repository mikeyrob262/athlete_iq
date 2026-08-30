import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import type { Athlete, Session, Gear, SessionInsert, GearInsert } from './lib/types'
import {
  LayoutDashboard,
  Bike,
  Package,
  Plus,
  Trash2,
  Activity,
  Timer,
  Mountain,
  Heart,
  Zap,
  TrendingUp,
  Calendar,
  User,
} from 'lucide-react'
import { formatDuration, formatDistance, formatElevation, formatDate } from './lib/format'
import { getSessionIcon, getSessionColor, getGearIcon, getGearColor } from './lib/icons'

type Tab = 'dashboard' | 'sessions' | 'gear'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [gear, setGear] = useState<Gear[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddGear, setShowAddGear] = useState(false)
  const [showAddAthlete, setShowAddAthlete] = useState(false)

  const fetchAthletes = useCallback(async () => {
    const { data, error } = await supabase.from('athletes').select('*').order('created_at', { ascending: true })
    if (error) {
      console.error('Failed to load athletes:', error.message)
      return
    }
    setAthletes(data || [])
    if (data && data.length > 0 && !selectedAthleteId) {
      setSelectedAthleteId(data[0].id)
    }
  }, [selectedAthleteId])

  const fetchSessions = useCallback(async () => {
    if (!selectedAthleteId) return
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('athlete_id', selectedAthleteId)
      .order('started_at', { ascending: false })
    if (error) {
      console.error('Failed to load sessions:', error.message)
      return
    }
    setSessions(data || [])
  }, [selectedAthleteId])

  const fetchGear = useCallback(async () => {
    if (!selectedAthleteId) return
    const { data, error } = await supabase
      .from('gear')
      .select('*')
      .eq('athlete_id', selectedAthleteId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Failed to load gear:', error.message)
      return
    }
    setGear(data || [])
  }, [selectedAthleteId])

  useEffect(() => {
    (async () => {
      setLoading(true)
      await fetchAthletes()
      setLoading(false)
    })()
  }, [fetchAthletes])

  useEffect(() => {
    if (selectedAthleteId) {
      fetchSessions()
      fetchGear()
    }
  }, [selectedAthleteId, fetchSessions, fetchGear])

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || null

  const handleDeleteSession = async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete session:', error.message)
      return
    }
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleDeleteGear = async (id: string) => {
    const { error } = await supabase.from('gear').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete gear:', error.message)
      return
    }
    setGear((prev) => prev.filter((g) => g.id !== id))
  }

  const handleAddSession = async (session: SessionInsert) => {
    const { data, error } = await supabase.from('sessions').insert(session).select().single()
    if (error) {
      console.error('Failed to add session:', error.message)
      return false
    }
    setSessions((prev) => [data, ...prev])
    return true
  }

  const handleAddGear = async (gearItem: GearInsert) => {
    const { data, error } = await supabase.from('gear').insert(gearItem).select().single()
    if (error) {
      console.error('Failed to add gear:', error.message)
      return false
    }
    setGear((prev) => [...prev, data])
    return true
  }

  const handleAddAthlete = async (athlete: { first_name: string; last_name: string; ftp?: number; weight_kg?: number }) => {
    const { data, error } = await supabase.from('athletes').insert(athlete).select().single()
    if (error) {
      console.error('Failed to add athlete:', error.message)
      return false
    }
    setAthletes((prev) => [...prev, data])
    setSelectedAthleteId(data.id)
    return true
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <Bike />
          </div>
          <div>
            <div className="brand-name">Athlete IQ</div>
            <div className="brand-tag">Training Tracker</div>
          </div>
        </div>
        <nav className="tabs">
          <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
            <LayoutDashboard /> Dashboard
          </button>
          <button className={`tab ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}>
            <Activity /> Sessions
          </button>
          <button className={`tab ${tab === 'gear' ? 'active' : ''}`} onClick={() => setTab('gear')}>
            <Package /> Gear
          </button>
        </nav>
      </header>

      {athletes.length === 0 ? (
        <EmptyState
          icon={<User />}
          title="No athletes yet"
          message="Add your first athlete profile to start tracking training sessions and gear."
          action={<button className="btn btn-primary" onClick={() => setShowAddAthlete(true)}><Plus /> Add Athlete</button>}
        />
      ) : (
        <>
          <div className="athlete-selector">
            <User size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <select
              className="form-select"
              value={selectedAthleteId || ''}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
            <button className="btn btn-ghost" onClick={() => setShowAddAthlete(true)}>
              <Plus /> New Athlete
            </button>
          </div>

          {tab === 'dashboard' && selectedAthlete && (
            <Dashboard athlete={selectedAthlete} sessions={sessions} gear={gear} />
          )}
          {tab === 'sessions' && (
            <SessionsView
              sessions={sessions}
              gear={gear}
              athleteId={selectedAthleteId!}
              onAdd={handleAddSession}
              onDelete={handleDeleteSession}
              showAdd={showAddSession}
              setShowAdd={setShowAddSession}
            />
          )}
          {tab === 'gear' && (
            <GearView
              gear={gear}
              athleteId={selectedAthleteId!}
              onAdd={handleAddGear}
              onDelete={handleDeleteGear}
              showAdd={showAddGear}
              setShowAdd={setShowAddGear}
            />
          )}
        </>
      )}

      {showAddAthlete && (
        <AddAthleteModal onClose={() => setShowAddAthlete(false)} onAdd={handleAddAthlete} />
      )}
    </div>
  )
}

function EmptyState({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}

function Dashboard({ athlete, sessions, gear }: { athlete: Athlete; sessions: Session[]; gear: Gear[] }) {
  const totalSessions = sessions.length
  const totalDistance = sessions.reduce((sum, s) => sum + (s.distance_meters || 0), 0)
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0)
  const totalElevation = sessions.reduce((sum, s) => sum + (s.elevation_gain_meters || 0), 0)

  const last7Days = sessions.filter((s) => {
    const d = new Date(s.started_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  })
  const weekDistance = last7Days.reduce((sum, s) => sum + (s.distance_meters || 0), 0)

  const initials = `${athlete.first_name[0] || ''}${athlete.last_name[0] || ''}`.toUpperCase()

  return (
    <>
      <div className="athlete-card">
        <div className="athlete-avatar">{initials}</div>
        <div className="athlete-details">
          <h3>{athlete.first_name} {athlete.last_name}</h3>
          <div className="athlete-stats">
            {athlete.ftp && <span className="athlete-stat"><strong>{athlete.ftp} W</strong> FTP</span>}
            {athlete.weight_kg && <span className="athlete-stat"><strong>{athlete.weight_kg} kg</strong> Weight</span>}
            {athlete.ftp && athlete.weight_kg && (
              <span className="athlete-stat"><strong>{(athlete.ftp / athlete.weight_kg).toFixed(1)} W/kg</strong> Power-to-Weight</span>
            )}
            <span className="athlete-stat"><strong>{gear.length}</strong> Gear Items</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Activity />} label="Total Sessions" value={totalSessions.toString()} color="#3d9bff" />
        <StatCard icon={<TrendingUp />} label="Total Distance" value={formatDistance(totalDistance)} color="#00d4a8" />
        <StatCard icon={<Timer />} label="Total Time" value={formatDuration(totalDuration)} color="#ffb946" />
        <StatCard icon={<Mountain />} label="Total Elevation" value={formatElevation(totalElevation)} color="#ff5c5c" />
        <StatCard icon={<Calendar />} label="This Week" value={`${last7Days.length} sessions`} color="#64b4ff" />
        <StatCard icon={<TrendingUp />} label="Week Distance" value={formatDistance(weekDistance)} color="#00d4a8" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Sessions</h2>
        </div>
        {sessions.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, padding: 16 }}>No sessions logged yet. Head to the Sessions tab to add one.</p>
        ) : (
          <div className="session-list">
            {sessions.slice(0, 5).map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="stat-card" style={{ ['--stat-color' as string]: color, ['--stat-soft' as string]: `${color}1f` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function SessionRow({ session, onDelete }: { session: Session; onDelete?: (id: string) => void }) {
  const Icon = getSessionIcon(session.type)
  const color = getSessionColor(session.type)
  return (
    <div className="session-item">
      <div className="session-type-icon" style={{ background: color.bg, color: color.color }}>
        <Icon />
      </div>
      <div className="session-info">
        <div className="session-title">{session.type}</div>
        <div className="session-meta">
          <span><Calendar /> {formatDate(session.started_at)}</span>
          <span><Timer /> {formatDuration(session.duration_seconds)}</span>
          {session.distance_meters != null && <span><TrendingUp /> {formatDistance(session.distance_meters)}</span>}
          {session.elevation_gain_meters != null && <span><Mountain /> {formatElevation(session.elevation_gain_meters)}</span>}
          {session.avg_heart_rate != null && <span><Heart /> {session.avg_heart_rate} bpm</span>}
          {session.avg_power != null && <span><Zap /> {session.avg_power} W</span>}
        </div>
      </div>
      {onDelete && (
        <div className="session-actions">
          <button className="btn btn-danger" onClick={() => onDelete(session.id)} title="Delete session">
            <Trash2 />
          </button>
        </div>
      )}
    </div>
  )
}

function SessionsView({
  sessions,
  gear,
  athleteId,
  onAdd,
  onDelete,
  showAdd,
  setShowAdd,
}: {
  sessions: Session[]
  gear: Gear[]
  athleteId: string
  onAdd: (s: SessionInsert) => Promise<boolean>
  onDelete: (id: string) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Training Sessions</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus /> Log Session
        </button>
      </div>
      {sessions.length === 0 ? (
        <EmptyState
          icon={<Activity />}
          title="No sessions yet"
          message="Log your first training session to start tracking your progress."
          action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus /> Log Session</button>}
        />
      ) : (
        <div className="session-list">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} onDelete={onDelete} />
          ))}
        </div>
      )}
      {showAdd && (
        <AddSessionModal
          gear={gear}
          athleteId={athleteId}
          onClose={() => setShowAdd(false)}
          onAdd={onAdd}
        />
      )}
    </div>
  )
}

function GearView({
  gear,
  athleteId,
  onAdd,
  onDelete,
  showAdd,
  setShowAdd,
}: {
  gear: Gear[]
  athleteId: string
  onAdd: (g: GearInsert) => Promise<boolean>
  onDelete: (id: string) => void
  showAdd: boolean
  setShowAdd: (v: boolean) => void
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Gear Inventory</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus /> Add Gear
        </button>
      </div>
      {gear.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No gear yet"
          message="Add your bikes, shoes, and other equipment to track mileage."
          action={<button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus /> Add Gear</button>}
        />
      ) : (
        <div className="gear-grid">
          {gear.map((g) => {
            const Icon = getGearIcon(g.type)
            const color = getGearColor(g.type)
            return (
              <div key={g.id} className="gear-card">
                <div className="gear-card-header">
                  <div className="gear-icon" style={{ background: color.bg, color: color.color }}>
                    <Icon />
                  </div>
                  <div>
                    <div className="gear-name">{g.name}</div>
                    <div className="gear-type">{g.type.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="gear-stats">
                  {g.manufacturer && (
                    <div className="gear-stat">
                      <span className="gear-stat-label">Manufacturer</span>
                      <span className="gear-stat-value">{g.manufacturer}</span>
                    </div>
                  )}
                  {g.model && (
                    <div className="gear-stat">
                      <span className="gear-stat-label">Model</span>
                      <span className="gear-stat-value">{g.model}</span>
                    </div>
                  )}
                  <div className="gear-stat">
                    <span className="gear-stat-label">Mileage</span>
                    <span className="gear-stat-value">{g.current_mileage_km.toFixed(0)} km</span>
                  </div>
                  {g.purchase_date && (
                    <div className="gear-stat">
                      <span className="gear-stat-label">Purchased</span>
                      <span className="gear-stat-value">{formatDate(g.purchase_date)}</span>
                    </div>
                  )}
                </div>
                <div className="session-actions">
                  <button className="btn btn-danger" onClick={() => onDelete(g.id)} title="Delete gear">
                    <Trash2 />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {showAdd && (
        <AddGearModal
          athleteId={athleteId}
          onClose={() => setShowAdd(false)}
          onAdd={onAdd}
        />
      )}
    </div>
  )
}

function AddSessionModal({
  gear,
  athleteId,
  onClose,
  onAdd,
}: {
  gear: Gear[]
  athleteId: string
  onClose: () => void
  onAdd: (s: SessionInsert) => Promise<boolean>
}) {
  const [type, setType] = useState<Session['type']>('ride')
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 16))
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [elevation, setElevation] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [power, setPower] = useState('')
  const [gearId, setGearId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dur = parseInt(duration, 10)
    if (!dur || dur <= 0) {
      setError('Duration must be greater than 0')
      return
    }
    const session: SessionInsert = {
      athlete_id: athleteId,
      type,
      started_at: new Date(startedAt).toISOString(),
      duration_seconds: dur,
      distance_meters: distance ? parseFloat(distance) * 1000 : null,
      elevation_gain_meters: elevation ? parseFloat(elevation) : null,
      avg_heart_rate: heartRate ? parseInt(heartRate, 10) : null,
      avg_power: power ? parseInt(power, 10) : null,
      gear_id: gearId || null,
    }
    const ok = await onAdd(session)
    if (ok) onClose()
    else setError('Failed to save session. Please try again.')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Log Training Session</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Activity Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value as Session['type'])}>
              <option value="ride">Ride</option>
              <option value="run">Run</option>
              <option value="walk">Walk</option>
              <option value="strength">Strength</option>
              <option value="swim">Swim</option>
              <option value="race">Race</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Distance (km)</label>
              <input className="form-input" type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="25.0" />
            </div>
            <div className="form-group">
              <label className="form-label">Elevation (m)</label>
              <input className="form-input" type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} placeholder="350" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Avg Heart Rate (bpm)</label>
              <input className="form-input" type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="145" />
            </div>
            <div className="form-group">
              <label className="form-label">Avg Power (W)</label>
              <input className="form-input" type="number" value={power} onChange={(e) => setPower(e.target.value)} placeholder="220" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Gear Used (optional)</label>
            <select className="form-select" value={gearId} onChange={(e) => setGearId(e.target.value)}>
              <option value="">None</option>
              {gear.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Session</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddGearModal({
  athleteId,
  onClose,
  onAdd,
}: {
  athleteId: string
  onClose: () => void
  onAdd: (g: GearInsert) => Promise<boolean>
}) {
  const [type, setType] = useState<Gear['type']>('bike')
  const [name, setName] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    const gearItem: GearInsert = {
      athlete_id: athleteId,
      type,
      name: name.trim(),
      manufacturer: manufacturer.trim() || null,
      model: model.trim() || null,
      purchase_date: purchaseDate || null,
    }
    const ok = await onAdd(gearItem)
    if (ok) onClose()
    else setError('Failed to save gear. Please try again.')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add Gear</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Gear Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value as Gear['type'])}>
              <option value="bike">Bike</option>
              <option value="shoe">Shoe</option>
              <option value="wheelset">Wheelset</option>
              <option value="power_meter">Power Meter</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tarmac SL7" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input className="form-input" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="Specialized" />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="SL7" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input className="form-input" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Gear</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddAthleteModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (a: { first_name: string; last_name: string; ftp?: number; weight_kg?: number }) => Promise<boolean>
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [ftp, setFtp] = useState('')
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required')
      return
    }
    const athlete = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      ftp: ftp ? parseInt(ftp, 10) : undefined,
      weight_kg: weight ? parseFloat(weight) : undefined,
    }
    const ok = await onAdd(athlete)
    if (ok) onClose()
    else setError('Failed to add athlete. Please try again.')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add Athlete</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Alex" required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Morgan" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">FTP (W)</label>
              <input className="form-input" type="number" value={ftp} onChange={(e) => setFtp(e.target.value)} placeholder="250" />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70.0" />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Athlete</button>
          </div>
        </form>
      </div>
    </div>
  )
}
