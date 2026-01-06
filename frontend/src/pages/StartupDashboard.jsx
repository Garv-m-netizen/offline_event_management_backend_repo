import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import EventCard from '../components/EventCard'

const StartupDashboard = () => {
  const { api } = useAuth()
  const [events, setEvents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [eventsRes, enrollmentsRes] = await Promise.all([
        api.get('/events'),
        api.get('/enrollments/my'),
      ])
      setEvents(eventsRes.data)
      setEnrollments(enrollmentsRes.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentStatus = (eventName) => {
    const enrollment = enrollments.find((e) => e.event_name === eventName)
    return enrollment ? enrollment.status : null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">All Events</h1>

        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const enrollmentStatus = getEnrollmentStatus(event.name)
              return (
                <div key={event.name} className="relative">
                  <EventCard event={event} />
                  {enrollmentStatus && (
                    <div className="mt-2 text-center">
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                        {enrollmentStatus === 'submitted'
                          ? 'Enrolled'
                          : 'Shortlisted'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StartupDashboard

