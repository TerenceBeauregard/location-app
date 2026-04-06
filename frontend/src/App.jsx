import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, createContext, useContext, useEffect, useRef } from 'react'

const queryClient = new QueryClient()

// --- Auth Context ---
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  function login(data) { localStorage.setItem('user', JSON.stringify(data)); setUser(data) }
  function logout() { localStorage.removeItem('user'); setUser(null) }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

function useAuth() { return useContext(AuthContext) }

// --- Dark mode ---
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, setDark]
}

// --- API ---
const API = '/api'

async function apiFetch(path, options = {}) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (user?.token) headers['Authorization'] = `Bearer ${user.token}`
  const res = await fetch(`${API}${path}`, { ...options, headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Error ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

// --- Shared styles ---
const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300"
const btnPrimary = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"

const typeColors = {
  APARTMENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HOUSE:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  STUDIO:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ROOM:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

function ErrorMsg({ msg }) {
  if (!msg) return null
  return <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">{msg}</div>
}

// --- App ---
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function NavLink({ to, children }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link to={to} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
      active
        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
    }`}>
      {children}
    </Link>
  )
}

function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useDarkMode()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <nav className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">RentalApp</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/listings">Listings</NavLink>
                {user?.role === 'OWNER' && <NavLink to="/my-listings">My Properties</NavLink>}
                {user && <NavLink to="/my-bookings">My Bookings</NavLink>}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
              <button onClick={() => setDark(d => !d)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {dark ? '☀️' : '🌙'}
              </button>
              {user ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email} <span className="text-xs text-indigo-500 font-medium">({user.role})</span>
                  </span>
                  <button onClick={() => { logout(); navigate('/') }}
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Sign up</Link>
                  <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Log in</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/my-listings" element={<OwnerDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </div>
  )
}

// --- Home ---
function Home() {
  const { user } = useAuth()
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
        <span className="block xl:inline">Find your next</span>{' '}
        <span className="block text-indigo-600 dark:text-indigo-400 xl:inline">dream home</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        The microservices-powered platform for renting properties around the globe.
      </p>
      <div className="mt-8 flex justify-center gap-4 flex-wrap">
        <Link to="/listings" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors">Browse listings</Link>
        {!user && <Link to="/register" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Get started</Link>}
        {user?.role === 'OWNER' && <Link to="/my-listings" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Manage my properties</Link>}
      </div>
    </div>
  )
}

// --- Auth pages ---
function AuthCard({ title, children }) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="text-center text-3xl font-extrabold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function Login() {
  const { login } = useAuth(); const navigate = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(null); const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    try {
      const data = await apiFetch('/auth-service/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      login(data); navigate(data.role === 'OWNER' ? '/my-listings' : '/')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <AuthCard title="Sign in to your account">
      <ErrorMsg msg={error} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div><label className={labelClass}>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></div>
        <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">No account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium">Create one</Link></p>
    </AuthCard>
  )
}

function Register() {
  const { login } = useAuth(); const navigate = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState('TENANT')
  const [error, setError] = useState(null); const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setError(null); setLoading(true)
    try {
      const data = await apiFetch('/auth-service/auth/register', { method: 'POST', body: JSON.stringify({ email, password, role }) })
      login(data); navigate(data.role === 'OWNER' ? '/my-listings' : '/')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <AuthCard title="Create your account">
      <ErrorMsg msg={error} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div><label className={labelClass}>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></div>
        <div>
          <label className={labelClass}>I am a...</label>
          <select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
            <option value="TENANT">Tenant — I'm looking to rent</option>
            <option value="OWNER">Owner — I want to list my property</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium">Sign in</Link></p>
    </AuthCard>
  )
}

// --- Listings page with filters ---
function Listings() {
  const [filters, setFilters] = useState({ type: '', location: '', minPrice: '', maxPrice: '' })
  const [applied, setApplied] = useState({})

  function buildQuery(f) {
    const p = new URLSearchParams()
    if (f.type) p.set('type', f.type)
    if (f.location) p.set('location', f.location)
    if (f.minPrice) p.set('minPrice', f.minPrice)
    if (f.maxPrice) p.set('maxPrice', f.maxPrice)
    return p.toString()
  }

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['listings', applied],
    queryFn: () => {
      const qs = buildQuery(applied)
      return apiFetch(`/listing-service/listings${qs ? '?' + qs : ''}`)
    },
  })

  function handleApply(e) { e.preventDefault(); setApplied({ ...filters }) }
  function handleReset() { setFilters({ type: '', location: '', minPrice: '', maxPrice: '' }); setApplied({}) }

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-6">Available Properties</h2>

      {/* Filter bar */}
      <form onSubmit={handleApply} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg p-4 mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
        <div>
          <label className={labelClass}>Type</label>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className={inputClass}>
            <option value="">All types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="STUDIO">Studio</option>
            <option value="ROOM">Room</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            placeholder="City, neighborhood…" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Min price (€/mo)</label>
          <input type="number" min="0" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Max price (€/mo)</label>
          <input type="number" min="0" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">Search</button>
          <button type="button" onClick={handleReset} className="py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Reset</button>
        </div>
      </form>

      {isLoading && <div className="text-center mt-12 text-gray-400">Loading listings…</div>}
      {error && <div className="text-center mt-12 text-red-500">Failed to load listings: {error.message}</div>}
      {!isLoading && listings?.length === 0 && (
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No properties match your search.</p>
          <button onClick={handleReset} className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Clear filters</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </div>
  )
}

// --- Listing card with booking panel ---
function ListingCard({ listing }) {
  const { user } = useAuth()
  const [showBooking, setShowBooking] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg flex flex-col transition-colors">
      <div className="px-5 py-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold leading-tight">{listing.title}</h3>
          {listing.type && (
            <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>
              {listing.type}
            </span>
          )}
        </div>
        {listing.location && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">📍 {listing.location}</p>}
        {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{listing.description}</p>}
      </div>

      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
          {listing.pricePerMonth != null ? `${Number(listing.pricePerMonth).toLocaleString('fr-FR')} €` : '—'}
          <span className="text-sm font-normal text-gray-400"> /mo</span>
        </span>
        {user?.role === 'TENANT' && (
          <button onClick={() => setShowBooking(v => !v)}
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-colors">
            {showBooking ? 'Close' : 'Book'}
          </button>
        )}
        {!user && (
          <Link to="/login" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Login to book</Link>
        )}
      </div>

      {showBooking && <BookingPanel listing={listing} onClose={() => setShowBooking(false)} />}
    </div>
  )
}

// --- Booking panel (inline below the card) ---
function BookingPanel({ listing, onClose }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const { data: bookings } = useQuery({
    queryKey: ['bookings-listing', listing.id],
    queryFn: () => apiFetch(`/booking-service/bookings/listing/${listing.id}`),
  })

  const nights = startDate && endDate
    ? Math.round((new Date(endDate) - new Date(startDate)) / 86400000)
    : 0
  const total = nights > 0 && listing.pricePerMonth
    ? ((Number(listing.pricePerMonth) / 30) * nights).toFixed(2)
    : null

  const activeBookings = bookings?.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED') ?? []

  const mutation = useMutation({
    mutationFn: (body) => apiFetch('/booking-service/bookings', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setSuccess(true)
      qc.invalidateQueries({ queryKey: ['bookings-listing', listing.id] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: (err) => setError(err.message),
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    mutation.mutate({ listingId: listing.id, tenantId: user.userId, startDate, endDate })
  }

  if (success) {
    return (
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 rounded-b-lg">
        <p className="text-green-700 dark:text-green-400 font-medium text-sm">Booking request sent!</p>
        <button onClick={onClose} className="mt-2 text-sm text-gray-500 hover:underline">Close</button>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/10">
      <h4 className="font-semibold text-sm mb-3">Reserve this property</h4>

      {activeBookings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Already booked:</p>
          <div className="flex flex-col gap-1">
            {activeBookings.map(b => (
              <span key={b.id} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full w-fit">
                {b.startDate} → {b.endDate}
                <span className="ml-1 opacity-60">({b.status})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <ErrorMsg msg={error} />
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Check-in</label>
            <input type="date" required min={today} value={startDate}
              onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate('') }}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Check-out</label>
            <input type="date" required min={startDate || today} value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={inputClass} />
          </div>
        </div>

        {total && (
          <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{nights} night{nights > 1 ? 's' : ''} × {(Number(listing.pricePerMonth) / 30).toFixed(0)} €/night</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{Number(total).toLocaleString('fr-FR')} €</span>
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending || !startDate || !endDate}
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors">
            {mutation.isPending ? 'Booking…' : 'Confirm booking'}
          </button>
          <button type="button" onClick={onClose}
            className="py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// --- My Bookings ---
function MyBookings() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.userId],
    queryFn: () => apiFetch(`/booking-service/bookings/tenant/${user.userId}`),
    enabled: !!user?.userId,
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => apiFetch(`/booking-service/bookings/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  })

  if (!user) return <Navigate to="/login" replace />

  const statusColors = {
    PENDING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    REJECTED:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-6">My Bookings</h2>
      {isLoading && <div className="text-center text-gray-400">Loading…</div>}
      {!isLoading && bookings?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-12">No bookings yet. <Link to="/listings" className="text-indigo-600 dark:text-indigo-400 hover:underline">Browse listings</Link></p>
      )}
      <div className="space-y-4">
        {bookings?.map(b => (
          <div key={b.id} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg px-5 py-4 flex items-center justify-between gap-4 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                <span className="text-xs text-gray-400 truncate">#{b.id.slice(0, 8)}</span>
              </div>
              <p className="text-sm font-medium">{b.startDate} <span className="text-gray-400">→</span> {b.endDate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Listing: {b.listingId.slice(0, 8)}…</p>
            </div>
            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
              <button onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending}
                className="shrink-0 text-sm text-red-500 hover:text-red-700 dark:text-red-400 font-medium disabled:opacity-50 transition-colors">
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Owner Dashboard ---
function OwnerDashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings', user?.userId],
    queryFn: () => apiFetch(`/listing-service/listings/owner/${user.userId}`),
    enabled: !!user?.userId,
  })

  const createMutation = useMutation({
    mutationFn: (body) => apiFetch('/listing-service/listings', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-listings'] }); qc.invalidateQueries({ queryKey: ['listings'] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/listing-service/listings/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-listings'] }); qc.invalidateQueries({ queryKey: ['listings'] }) },
  })

  const [form, setForm] = useState({ title: '', description: '', location: '', pricePerMonth: '', type: 'APARTMENT' })
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'OWNER') return <Navigate to="/" replace />

  async function handleCreate(e) {
    e.preventDefault(); setFormError(null)
    try {
      await createMutation.mutateAsync({
        ownerId: user.userId,
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        pricePerMonth: form.pricePerMonth ? Number(form.pricePerMonth) : null,
        type: form.type,
      })
      setForm({ title: '', description: '', location: '', pricePerMonth: '', type: 'APARTMENT' })
      setShowForm(false)
    } catch (err) { setFormError(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold">My Properties</h2>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          {showForm ? 'Cancel' : '+ Add property'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg p-6 mb-8 transition-colors">
          <h3 className="text-lg font-semibold mb-4">New property</h3>
          <ErrorMsg msg={formError} />
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price per month (€)</label>
              <input type="number" min="0" step="0.01" value={form.pricePerMonth} onChange={e => setForm(f => ({ ...f, pricePerMonth: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="STUDIO">Studio</option>
                <option value="ROOM">Room</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors">
                {createMutation.isPending ? 'Saving…' : 'Save property'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-400">Loading…</div>}
      {!isLoading && listings?.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <p className="text-lg">No properties yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Add your first property</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => (
          <div key={listing.id} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg flex flex-col transition-colors">
            <div className="px-5 py-4 flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-semibold">{listing.title}</h3>
                <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>{listing.type}</span>
              </div>
              {listing.location && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📍 {listing.location}</p>}
              {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{listing.description}</p>}
            </div>
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {listing.pricePerMonth != null ? `${Number(listing.pricePerMonth).toLocaleString('fr-FR')} €/mo` : '—'}
              </span>
              <button onClick={() => deleteMutation.mutate(listing.id)} disabled={deleteMutation.isPending}
                className="text-red-500 hover:text-red-700 dark:text-red-400 text-sm font-medium disabled:opacity-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
