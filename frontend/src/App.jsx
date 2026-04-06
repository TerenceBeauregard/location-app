import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, createContext, useContext } from 'react'

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

function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">RentalApp</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="text-gray-900 border-indigo-500 border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium">Home</Link>
                <Link to="/listings" className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">Listings</Link>
                {user?.role === 'OWNER' && (
                  <Link to="/my-listings" className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">My Properties</Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email} <span className="text-xs text-indigo-500 font-medium">({user.role})</span></span>
                  <button onClick={handleLogout} className="text-gray-500 border border-gray-300 p-2 rounded-md text-sm hover:bg-gray-50 px-4">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-indigo-600 border border-indigo-600 p-2 rounded-md font-medium hover:bg-indigo-50 px-4 text-sm">Sign up</Link>
                  <Link to="/login" className="bg-indigo-600 p-2 rounded-md text-white font-medium hover:bg-indigo-700 px-4 text-sm">Log in</Link>
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
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
        <span className="block xl:inline">Find your next</span>{' '}
        <span className="block text-indigo-600 xl:inline">dream home</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        The microservices-powered platform for renting properties around the globe.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/listings" className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700">Browse listings</Link>
        {!user && <Link to="/register" className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-indigo-50">Get started</Link>}
        {user?.role === 'OWNER' && <Link to="/my-listings" className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-indigo-50">Manage my properties</Link>}
      </div>
    </div>
  )
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
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">Sign in to your account</h2>
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          No account yet?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Create one</Link>
        </p>
      </div>
    </div>
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
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">Create your account</h2>
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">I am a...</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="TENANT">Tenant — I'm looking to rent</option>
              <option value="OWNER">Owner — I want to list my property</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </p>
      </div>
    </div>
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
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Available Properties</h2>
      {listings?.length === 0 && (
        <p className="text-gray-500 text-center mt-12">No properties available at the moment.</p>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}

function ListingCard({ listing }) {
  const typeColors = {
    APARTMENT: 'bg-blue-100 text-blue-700',
    HOUSE: 'bg-green-100 text-green-700',
    STUDIO: 'bg-purple-100 text-purple-700',
    ROOM: 'bg-yellow-100 text-yellow-700',
  }
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
      <div className="px-5 py-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{listing.title}</h3>
          {listing.type && (
            <span className={`ml-2 shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[listing.type] || 'bg-gray-100 text-gray-600'}`}>
              {listing.type}
            </span>
          )}
        </div>
        {listing.location && <p className="text-sm text-gray-500 mb-2">{listing.location}</p>}
        {listing.description && <p className="text-sm text-gray-600 line-clamp-3">{listing.description}</p>}
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <span className="text-indigo-600 font-bold text-lg">
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
        <h2 className="text-3xl font-extrabold text-gray-900">My Properties</h2>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          {showForm ? 'Cancel' : '+ Add property'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New property</h3>
          {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price per month (€)</label>
              <input type="number" min="0" step="0.01" value={form.pricePerMonth} onChange={e => setForm(f => ({ ...f, pricePerMonth: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="STUDIO">Studio</option>
                <option value="ROOM">Room</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={createMutation.isPending}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {createMutation.isPending ? 'Saving...' : 'Save property'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <div className="text-center text-gray-400">Loading...</div>}

      {!isLoading && listings?.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg">You haven't listed any properties yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600 font-medium hover:underline">Add your first property</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map(listing => (
          <div key={listing.id} className="bg-white shadow rounded-lg flex flex-col">
            <div className="px-5 py-4 flex-1">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900">{listing.title}</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2 shrink-0">{listing.type}</span>
              </div>
              {listing.location && <p className="text-sm text-gray-500 mb-1">{listing.location}</p>}
              {listing.description && <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>}
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-indigo-600 font-bold">
                {listing.pricePerMonth != null ? `${Number(listing.pricePerMonth).toLocaleString('fr-FR')} €/mo` : '—'}
              </span>
              <button onClick={() => deleteMutation.mutate(listing.id)}
                disabled={deleteMutation.isPending}
                className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
