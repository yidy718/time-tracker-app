import { useState, useEffect } from 'react'
import { supabase, auth, database } from '../lib/supabase'
import Auth from '../components/Auth'
import TimeTracker from '../components/TimeTracker'
import AdminDashboard from '../components/AdminDashboard'

export default function Home({ session }) {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchEmployee()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchEmployee = async () => {
    try {
      const { data, error } = await database.getCurrentEmployee(session.user.id)
      if (error) {
        console.error('Error fetching employee:', error)
        // If employee doesn't exist, this might be a new user
        if (error.code === 'PGRST116') {
          // No rows returned - new user needs to be set up
          setEmployee(null)
        }
      } else {
        setEmployee(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  if (!employee) {
    return <NewUserSetup session={session} onSetupComplete={fetchEmployee} />
  }

  // Route based on user role
  if (employee.role === 'admin' || employee.role === 'manager') {
    return <AdminDashboard session={session} employee={employee} />
  }

  return <TimeTracker session={session} employee={employee} />
}

// Component for new user setup
function NewUserSetup({ session, onSetupComplete }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    organizationName: '',
    role: 'admin' // First user is always admin
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create organization first
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: formData.organizationName })
        .select()
        .single()

      if (orgError) throw orgError

      // Create employee record
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .insert({
          id: session.user.id,
          organization_id: orgData.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: session.user.email,
          role: formData.role
        })
        .select()
        .single()

      if (empError) throw empError

      onSetupComplete()
    } catch (error) {
      console.error('Setup error:', error)
      alert('Error setting up account. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-glass max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">Let's set up your time tracking organization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.organizationName}
              onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
              placeholder="Enter your company name"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => auth.signOut()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>

        <footer className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            Made with ❤️ by yidy
          </div>
        </footer>
      </div>
    </div>
  )
}