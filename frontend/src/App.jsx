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
    throw new Error(data.message || `Erreur ${res.status}`)
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

const typeLabels = {
  APARTMENT: 'Appartement',
  HOUSE:     'Maison',
  STUDIO:    'Studio',
  ROOM:      'Chambre',
}

const typeGradients = {
  APARTMENT: 'from-blue-400 to-blue-600',
  HOUSE:     'from-green-400 to-green-600',
  STUDIO:    'from-purple-400 to-purple-600',
  ROOM:      'from-yellow-400 to-yellow-500',
}

function ListingPlaceholderImage({ type }) {
  const gradient = typeGradients[type] || 'from-gray-400 to-gray-600'
  return (
    <div className={`h-44 bg-gradient-to-br ${gradient} rounded-t-lg flex flex-col items-center justify-center gap-2`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
      <span className="text-white/70 text-xs font-medium tracking-wide uppercase">{typeLabels[type] || type}</span>
    </div>
  )
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
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">R&B</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/">Accueil</NavLink>
                <NavLink to="/listings">Annonces</NavLink>
                {user?.role === 'OWNER' && <NavLink to="/my-listings">Mes logements</NavLink>}
                {user && <NavLink to="/my-requests">Mes demandes</NavLink>}
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
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">S'inscrire</Link>
                  <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Se connecter</Link>
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
          <Route path="/my-requests" element={<MyRequests />} />
        </Routes>
      </main>
    </div>
  )
}

// --- Home ---
function Home() {
  const { user } = useAuth()

  const { data: allListings, isLoading } = useQuery({
    queryKey: ['listings', {}],
    queryFn: () => apiFetch('/listing-service/listings'),
  })

  const recentListings = allListings ? [...allListings].reverse().slice(0, 6) : []

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-20">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block xl:inline">Trouvez votre prochain</span>{' '}
          <span className="block text-indigo-600 dark:text-indigo-400 xl:inline">logement idéal</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:text-xl">
          La plateforme de location de logements propulsée par une architecture microservices.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link to="/listings" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold transition-colors">Voir toutes les annonces</Link>
          {!user && <Link to="/register" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-md font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Commencer</Link>}
          {user?.role === 'OWNER' && <Link to="/my-listings" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-md font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Gérer mes logements</Link>}
        </div>
      </div>

      {/* Dernières annonces */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dernières annonces</h2>
          <Link to="/listings" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Voir tout →</Link>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-400">Chargement des annonces...</div>
        )}

        {!isLoading && recentListings.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Aucune annonce disponible pour le moment.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentListings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
        </div>
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
    <AuthCard title="Connexion à votre compte">
      <ErrorMsg msg={error} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div><label className={labelClass}>E-mail</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Mot de passe</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></div>
        <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Pas de compte ? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium">En créer un</Link></p>
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
    <AuthCard title="Créer votre compte">
      <ErrorMsg msg={error} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div><label className={labelClass}>E-mail</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Mot de passe</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></div>
        <div>
          <label className={labelClass}>Je suis...</label>
          <select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
            <option value="TENANT">Locataire — Je cherche à louer</option>
            <option value="OWNER">Propriétaire — Je veux mettre en location</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Création en cours...' : 'Créer un compte'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Déjà un compte ? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium">Se connecter</Link></p>
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
      <h2 className="text-3xl font-extrabold mb-6">Logements disponibles</h2>

      {/* Filter bar */}
      <form onSubmit={handleApply} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg p-4 mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
        <div>
          <label className={labelClass}>Type</label>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className={inputClass}>
            <option value="">Tous les types</option>
            <option value="APARTMENT">Appartement</option>
            <option value="HOUSE">Maison</option>
            <option value="STUDIO">Studio</option>
            <option value="ROOM">Chambre</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Localisation</label>
          <input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            placeholder="Ville, quartier..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Prix min (€/nuit)</label>
          <input type="number" min="0" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Prix max (€/nuit)</label>
          <input type="number" min="0" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors">Rechercher</button>
          <button type="button" onClick={handleReset} className="py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Réinitialiser</button>
        </div>
      </form>

      {isLoading && <div className="text-center mt-12 text-gray-400">Chargement des annonces...</div>}
      {error && <div className="text-center mt-12 text-red-500">Erreur lors du chargement : {error.message}</div>}
      {!isLoading && listings?.length === 0 && (
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Aucun logement ne correspond à votre recherche.</p>
          <button onClick={handleReset} className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Effacer les filtres</button>
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
    <div className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg flex flex-col overflow-hidden transition-colors">
      {listing.imageUrl ? (
        <img src={listing.imageUrl} alt={listing.title} className="h-44 w-full object-cover" />
      ) : (
        <ListingPlaceholderImage type={listing.type} />
      )}

      <div className="px-5 py-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold leading-tight">{listing.title}</h3>
          {listing.type && (
            <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>
              {typeLabels[listing.type] || listing.type}
            </span>
          )}
        </div>
        {listing.location && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">📍 {listing.location}</p>}
        {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{listing.description}</p>}
      </div>

      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
          {listing.pricePerNight != null ? `${Number(listing.pricePerNight).toLocaleString('fr-FR')} €` : '—'}
          <span className="text-sm font-normal text-gray-400"> /nuit</span>
        </span>
        {user?.role === 'TENANT' && (
          <button onClick={() => setShowBooking(v => !v)}
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-colors">
            {showBooking ? 'Fermer' : 'Réserver'}
          </button>
        )}
        {!user && (
          <Link to="/login" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Connectez-vous pour réserver</Link>
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
  const total = nights > 0 && listing.pricePerNight
    ? (Number(listing.pricePerNight) * nights).toFixed(2)
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
        <p className="text-green-700 dark:text-green-400 font-medium text-sm">Demande de réservation envoyée !</p>
        <button onClick={onClose} className="mt-2 text-sm text-gray-500 hover:underline">Fermer</button>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/10">
      <h4 className="font-semibold text-sm mb-3">Réserver ce logement</h4>

      {activeBookings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Déjà réservé :</p>
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
            <label className={labelClass}>Arrivée</label>
            <input type="date" required min={today} value={startDate}
              onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate('') }}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Départ</label>
            <input type="date" required min={startDate || today} value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={inputClass} />
          </div>
        </div>

        {total && (
          <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{nights} nuit{nights > 1 ? 's' : ''} × {Number(listing.pricePerNight).toLocaleString('fr-FR')} €/nuit</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{Number(total).toLocaleString('fr-FR')} €</span>
          </div>
        )}

        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending || !startDate || !endDate}
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors">
            {mutation.isPending ? 'Réservation...' : 'Confirmer la réservation'}
          </button>
          <button type="button" onClick={onClose}
            className="py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Annuler
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
      <h2 className="text-3xl font-extrabold mb-6">Mes réservations</h2>
      {isLoading && <div className="text-center text-gray-400">Chargement...</div>}
      {!isLoading && bookings?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-12">Aucune réservation pour l'instant. <Link to="/listings" className="text-indigo-600 dark:text-indigo-400 hover:underline">Voir les annonces</Link></p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Logement : {b.listingId.slice(0, 8)}…</p>
            </div>
            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
              <button onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending}
                className="shrink-0 text-sm text-red-500 hover:text-red-700 dark:text-red-400 font-medium disabled:opacity-50 transition-colors">
                Annuler
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Mes demandes (Tenant + Owner) ---
function MyRequests() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'OWNER') return <OwnerRequests />
  return <TenantRequests />
}

function TenantRequests() {
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

  const statusColors = {
    PENDING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    REJECTED:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2">Mes demandes</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Vos réservations et leur statut</p>
      {isLoading && <div className="text-center text-gray-400">Chargement...</div>}
      {!isLoading && bookings?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-12">
          Aucune demande pour l'instant. <Link to="/listings" className="text-indigo-600 dark:text-indigo-400 hover:underline">Parcourir les annonces</Link>
        </p>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Logement : {b.listingId.slice(0, 8)}…</p>
            </div>
            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
              <button onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending}
                className="shrink-0 text-sm text-red-500 hover:text-red-700 dark:text-red-400 font-medium disabled:opacity-50 transition-colors">
                Annuler
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function OwnerRequests() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings', user?.userId],
    queryFn: () => apiFetch(`/listing-service/listings/owner/${user.userId}`),
    enabled: !!user?.userId,
  })

  const listingIds = listings?.map(l => l.id) ?? []
  const listingMap = Object.fromEntries(listings?.map(l => [l.id, l]) ?? [])

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['owner-requests', listingIds],
    queryFn: () => {
      const qs = listingIds.map(id => `ids=${id}`).join('&')
      return apiFetch(`/booking-service/bookings/by-listings?${qs}`)
    },
    enabled: listingIds.length > 0,
  })

  const confirmMutation = useMutation({
    mutationFn: (id) => apiFetch(`/booking-service/bookings/${id}/confirm`, { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-requests'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => apiFetch(`/booking-service/bookings/${id}/reject`, { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-requests'] }),
  })

  const statusColors = {
    PENDING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    REJECTED:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  }

  const isLoading = listingsLoading || (listingIds.length > 0 && bookingsLoading)

  const sortedBookings = [...(bookings ?? [])].sort((a, b) => {
    const order = { PENDING: 0, CONFIRMED: 1, REJECTED: 2, CANCELLED: 3 }
    return (order[a.status] ?? 9) - (order[b.status] ?? 9)
  })

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-2">Mes demandes</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Demandes de réservation reçues sur vos logements</p>

      {isLoading && <div className="text-center text-gray-400">Chargement...</div>}

      {!isLoading && listingIds.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-12">
          Vous n'avez aucun logement publié. <Link to="/my-listings" className="text-indigo-600 dark:text-indigo-400 hover:underline">Ajouter un logement</Link>
        </p>
      )}

      {!isLoading && listingIds.length > 0 && sortedBookings.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-12">Aucune demande reçue pour l'instant.</p>
      )}

      <div className="space-y-4">
        {sortedBookings.map(b => {
          const listing = listingMap[b.listingId]
          return (
            <div key={b.id} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg px-5 py-4 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                    {listing && (
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{listing.title}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{b.startDate} <span className="text-gray-400">→</span> {b.endDate}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Locataire : <span className="font-mono">{b.tenantId.slice(0, 8)}…</span>
                    {listing?.pricePerNight && (() => {
                      const nights = Math.round((new Date(b.endDate) - new Date(b.startDate)) / 86400000)
                      const total = (Number(listing.pricePerNight) * nights).toFixed(2)
                      return <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">{nights} nuit{nights > 1 ? 's' : ''} — {Number(total).toLocaleString('fr-FR')} €</span>
                    })()}
                  </p>
                </div>
                {b.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => confirmMutation.mutate(b.id)}
                      disabled={confirmMutation.isPending || rejectMutation.isPending}
                      className="px-3 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 transition-colors">
                      Confirmer
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(b.id)}
                      disabled={confirmMutation.isPending || rejectMutation.isPending}
                      className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors">
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
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

  const [form, setForm] = useState({ title: '', description: '', location: '', pricePerNight: '', type: 'APARTMENT' })
  const [imageFile, setImageFile] = useState(null)
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'OWNER') return <Navigate to="/" replace />

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

  async function handleCreate(e) {
    e.preventDefault(); setFormError(null)
    try {
      let base64Image = null
      if (imageFile) {
        base64Image = await toBase64(imageFile)
      }

      await createMutation.mutateAsync({
        ownerId: user.userId,
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        imageUrl: base64Image || null,
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : null,
        type: form.type,
      })
      setForm({ title: '', description: '', location: '', pricePerNight: '', type: 'APARTMENT' })
      setImageFile(null)
      setShowForm(false)
    } catch (err) { setFormError(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold">Mes logements</h2>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          {showForm ? 'Annuler' : '+ Ajouter un logement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg p-6 mb-8 transition-colors">
          <h3 className="text-lg font-semibold mb-4">Nouveau logement</h3>
          <ErrorMsg msg={formError} />
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Titre *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Localisation</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Prix par nuit (€)</label>
              <input type="number" min="0" step="0.01" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Image du logement</label>
              <input type="file" accept="image/*" onChange={e => { if (e.target.files.length > 0) setImageFile(e.target.files[0]) }} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="STUDIO">Studio</option>
                <option value="ROOM">Chambre</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors">
                {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-400">Chargement...</div>}
      {!isLoading && listings?.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <p className="text-lg">Aucun logement pour l'instant.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Ajouter votre premier logement</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => (
          <div key={listing.id} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg flex flex-col overflow-hidden transition-colors">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} className="h-44 w-full object-cover" />
            ) : (
              <ListingPlaceholderImage type={listing.type} />
            )}
            <div className="px-5 py-4 flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-semibold">{listing.title}</h3>
                <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>
                  {typeLabels[listing.type] || listing.type}
                </span>
              </div>
              {listing.location && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">📍 {listing.location}</p>}
              {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{listing.description}</p>}
            </div>
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {listing.pricePerNight != null ? `${Number(listing.pricePerNight).toLocaleString('fr-FR')} €/nuit` : '—'}
              </span>
              <button onClick={() => deleteMutation.mutate(listing.id)} disabled={deleteMutation.isPending}
                className="text-red-500 hover:text-red-700 dark:text-red-400 text-sm font-medium disabled:opacity-50 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
