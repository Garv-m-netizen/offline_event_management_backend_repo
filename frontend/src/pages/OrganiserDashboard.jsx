import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import EventCard from '../components/EventCard'

const OrganiserDashboard = () => {
  const { api } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    event_datetime: '',
    terms_and_conditions: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/events/my')
      setEvents(response.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/events', formData)
      setShowCreateForm(false)
      setFormData({
        name: '',
        description: '',
        image_url: '',
        event_datetime: '',
        terms_and_conditions: '',
      })
      fetchEvents()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event')
    }
  }

  const handleStatusUpdate = async (eventName, newStatus) => {
    try {
      await api.post('/events/update-status', {
        event_name: eventName,
        status: newStatus,
      })
      fetchEvents()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status')
    }
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Events</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create New Event
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500"
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="event_datetime"
                  required
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500"
                  value={formData.event_datetime}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Terms and Conditions
                </label>
                <textarea
                  name="terms_and_conditions"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500"
                  value={formData.terms_and_conditions}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events created yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Create your first event to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.name} className="relative">
                <EventCard event={event} />
                <div className="mt-2 flex space-x-2">
                  {event.status === 'upcoming' && (
                    <button
                      onClick={() => handleStatusUpdate(event.name, 'closed')}
                      className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Close Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrganiserDashboard

