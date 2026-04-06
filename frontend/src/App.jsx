import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, createContext, useContext, useEffect } from 'react'

const queryClient = new QueryClient()

// --- Auth Context ---
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  function login(data) {
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  function logout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

function useAuth() { return useContext(AuthContext) }

// --- Dark mode hook ---
function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return [dark, setDark]
}

// --- API helpers ---
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
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
        active
          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
      }`}
    >
      {children}
    </Link>
  )
}

function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useDarkMode()

  function handleLogout() {
    logout()
    navigate('/')
  }

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
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
              <button
                onClick={() => setDark(d => !d)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? '☀️' : '🌙'}
              </button>
              {user ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email} <span className="text-xs text-indigo-500 font-medium">({user.role})</span>
                  </span>
                  <button onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-gray-600 p-2 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 px-4 transition-colors">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register"
                    className="text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 p-2 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-4 text-sm transition-colors">
                    Sign up
                  </Link>
                  <Link to="/login"
                    className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-md text-white font-medium px-4 text-sm transition-colors">
                    Log in
                  </Link>
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
        </Routes>
      </main>
    </div>
  )
}

// --- Pages ---

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
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/listings" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
          Browse listings
        </Link>
        {!user && (
          <Link to="/register" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
            Get started
          </Link>
        )}
        {user?.role === 'OWNER' && (
          <Link to="/my-listings" className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
            Manage my properties
          </Link>
        )}
      </div>
    </div>
  )
}

function AuthCard({ title, children }) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:shadow-gray-800">
        <h2 className="text-center text-3xl font-extrabold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}

const inputClass = "mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300"
const btnPrimary = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"

function ErrorMsg({ msg }) {
  if (!msg) return null
  return <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-400">{msg}</div>
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch('/auth-service/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      login(data)
      navigate(data.role === 'OWNER' ? '/my-listings' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Sign in to your account">
      <ErrorMsg msg={error} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className={labelClass}>Email address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        No account yet?{' '}
        <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Create one</Link>
      </p>
    </AuthCard>
  )
}

function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('TENANT')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch('/auth-service/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      })
      login(data)
      navigate(data.role === 'OWNER' ? '/my-listings' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Create your account">
      <ErrorMsg msg={error} />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className={labelClass}>Email address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>I am a...</label>
          <select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
            <option value="TENANT">Tenant — I'm looking to rent</option>
            <option value="OWNER">Owner — I want to list my property</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Sign in</Link>
      </p>
    </AuthCard>
  )
}

function Listings() {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: () => apiFetch('/listing-service/listings'),
  })

  if (isLoading) return <div className="text-center mt-12 text-gray-400">Loading listings...</div>
  if (error) return <div className="text-center mt-12 text-red-500">Failed to load listings: {error.message}</div>

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-6">Available Properties</h2>
      {listings?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-12">No properties available at the moment.</p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </div>
  )
}

const typeColors = {
  APARTMENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HOUSE:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  STUDIO:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ROOM:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

function ListingCard({ listing }) {
  return (
    <div className="bg-white dark:bg-gray-900 overflow-hidden shadow dark:shadow-gray-800 rounded-lg flex flex-col transition-colors">
      <div className="px-5 py-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold leading-tight">{listing.title}</h3>
          {listing.type && (
            <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>
              {listing.type}
            </span>
          )}
        </div>
        {listing.location && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{listing.location}</p>}
        {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{listing.description}</p>}
      </div>
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">
          {listing.pricePerMonth != null ? `${Number(listing.pricePerMonth).toLocaleString('fr-FR')} €` : '—'}
          <span className="text-sm font-normal text-gray-400"> / month</span>
        </span>
      </div>
    </div>
  )
}

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] })
      qc.invalidateQueries({ queryKey: ['listings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/listing-service/listings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-listings'] })
      qc.invalidateQueries({ queryKey: ['listings'] })
    },
  })

  const [form, setForm] = useState({ title: '', description: '', location: '', pricePerMonth: '', type: 'APARTMENT' })
  const [formError, setFormError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'OWNER') return <Navigate to="/" replace />

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
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
    } catch (err) {
      setFormError(err.message)
    }
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
              <input type="number" min="0" step="0.01" value={form.pricePerMonth}
                onChange={e => setForm(f => ({ ...f, pricePerMonth: e.target.value }))} className={inputClass} />
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
              <textarea rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-50 transition-colors">
                {createMutation.isPending ? 'Saving...' : 'Save property'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-400">Loading...</div>}

      {!isLoading && listings?.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <p className="text-lg">You haven't listed any properties yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Add your first property
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => (
          <div key={listing.id} className="bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 rounded-lg flex flex-col transition-colors">
            <div className="px-5 py-4 flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-semibold">{listing.title}</h3>
                <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>
                  {listing.type}
                </span>
              </div>
              {listing.location && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{listing.location}</p>}
              {listing.description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{listing.description}</p>}
            </div>
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {listing.pricePerMonth != null ? `${Number(listing.pricePerMonth).toLocaleString('fr-FR')} €/mo` : '—'}
              </span>
              <button onClick={() => deleteMutation.mutate(listing.id)} disabled={deleteMutation.isPending}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
