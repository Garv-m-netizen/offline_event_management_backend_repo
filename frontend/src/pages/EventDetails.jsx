import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const EventDetails = () => {
  const { eventName } = useParams()
  const navigate = useNavigate()
  const { user, api } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollment, setEnrollment] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [accessRequests, setAccessRequests] = useState([])
  const [startups, setStartups] = useState([])
  const [eventEnrollments, setEventEnrollments] = useState([])
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [enrollFormData, setEnrollFormData] = useState({
    idea_name: '',
    idea_description: '',
    team_details: '',
  })
  const [accessRequested, setAccessRequested] = useState(false)
  const [accessApproved, setAccessApproved] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [eventName])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get('/events')
      const foundEvent = response.data.find((e) => e.name === decodeURIComponent(eventName))
      
      if (!foundEvent) {
        setError('Event not found')
        setLoading(false)
        return
      }

      setEvent(foundEvent)

      // Fetch role-specific data
      if (user.role === 'startup') {
        const enrollmentsRes = await api.get('/enrollments/my')
        const myEnrollment = enrollmentsRes.data.find(
          (e) => e.event_name === foundEvent.name
        )
        setEnrollment(myEnrollment)
      } else if (user.role === 'organiser' && foundEvent.organiser_email === user.email) {
        try {
          const [enrollmentsRes, requestsRes] = await Promise.all([
            api.get(`/events/${encodeURIComponent(foundEvent.name)}/enrollments`),
            api.get(`/investors/requests/${encodeURIComponent(foundEvent.name)}`),
          ])
          setEventEnrollments(enrollmentsRes.data)
          setAccessRequests(requestsRes.data)
        } catch (err) {
          // Handle errors gracefully
          if (err.response?.status !== 404) {
            console.error('Failed to fetch organiser data:', err)
          }
        }
      } else if (user.role === 'investor') {
        try {
          const startupsRes = await api.get(`/investors/event/${encodeURIComponent(foundEvent.name)}`)
          setStartups(startupsRes.data)
          setAccessApproved(true)
        } catch (err) {
          if (err.response?.status === 403) {
            // Check if access was requested
            setAccessRequested(true)
          }
        }
      }

      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch event details')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/enrollments', {
        event_name: event.name,
        ...enrollFormData,
      })
      setShowEnrollForm(false)
      fetchEventDetails()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll')
    }
  }

  const handleRequestAccess = async () => {
    try {
      await api.post('/investors/request-access', {
        event_name: event.name,
      })
      setAccessRequested(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request access')
    }
  }

  const handleApproveAccess = async (investorEmail, approve) => {
    try {
      await api.post('/investors/approve', {
        event_name: event.name,
        investor_email: investorEmail,
        approve,
      })
      fetchEventDetails()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update approval')
    }
  }

  const handleShortlist = async (startupEmail) => {
    try {
      await api.post('/investors/shortlist', {
        event_name: event.name,
        startup_email: startupEmail,
      })
      fetchEventDetails()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to shortlist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event not found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-6">
          <div className="h-64 bg-gray-700">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Event+Image'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{event.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                  event.status === 'upcoming' ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                {event.status}
              </span>
            </div>
            <p className="text-gray-300 mb-4">{event.description}</p>
            <div className="text-sm text-gray-400 mb-4">
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(event.event_datetime).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {event.terms_and_conditions && (
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <h3 className="font-semibold text-white mb-2">
                  Terms and Conditions
                </h3>
                <p className="text-gray-300 text-sm">
                  {event.terms_and_conditions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Startup-specific content */}
        {user.role === 'startup' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {enrollment ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Your Enrollment
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <strong>Idea Name:</strong> {enrollment.idea_name}
                  </p>
                  <p className="text-gray-300">
                    <strong>Status:</strong>{' '}
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        enrollment.status === 'shortlisted'
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {enrollment.status}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    <strong>Description:</strong> {enrollment.idea_description}
                  </p>
                  <p className="text-gray-300">
                    <strong>Team Details:</strong> {enrollment.team_details}
                  </p>
                </div>
              </div>
            ) : event.status === 'upcoming' ? (
              <div>
                {showEnrollForm ? (
                  <form onSubmit={handleEnrollSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Enroll in Event
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Idea Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md"
                        value={enrollFormData.idea_name}
                        onChange={(e) =>
                          setEnrollFormData({
                            ...enrollFormData,
                            idea_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Idea Description *
                      </label>
                      <textarea
                        required
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md"
                        value={enrollFormData.idea_description}
                        onChange={(e) =>
                          setEnrollFormData({
                            ...enrollFormData,
                            idea_description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Team Details *
                      </label>
                      <textarea
                        required
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-100 rounded-md"
                        value={enrollFormData.team_details}
                        onChange={(e) =>
                          setEnrollFormData({
                            ...enrollFormData,
                            team_details: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Submit Enrollment
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEnrollForm(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Enroll in this Event
                    </h2>
                    <button
                      onClick={() => setShowEnrollForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Enroll Now
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">This event is closed for enrollment.</p>
            )}
          </div>
        )}

        {/* Investor-specific content */}
        {user.role === 'investor' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {accessApproved ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Enrolled Startups
                </h2>
                {event.status === 'closed' ? (
                  startups.length > 0 ? (
                    <div className="space-y-4">
                      {startups.map((startup, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-gray-700 rounded border border-gray-600"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white">
                              {startup.idea_name}
                            </h3>
                            {startup.status === 'shortlisted' ? (
                              <span className="px-2 py-1 bg-green-600 text-white text-sm rounded">
                                Shortlisted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleShortlist(startup.startup_email)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Shortlist
                              </button>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">
                            <strong>Startup:</strong> {startup.startup_email}
                          </p>
                          <p className="text-gray-300 text-sm mb-2">
                            {startup.idea_description}
                          </p>
                          <p className="text-gray-300 text-sm">
                            <strong>Team:</strong> {startup.team_details}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No startups enrolled yet.</p>
                  )
                ) : (
                  <p className="text-gray-400">
                    Startups will be visible after the event is closed.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Request Access
                </h2>
                {accessRequested ? (
                  <p className="text-gray-400">
                    Access request submitted. Waiting for organiser approval.
                  </p>
                ) : (
                  <button
                    onClick={handleRequestAccess}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Request Access
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Organiser-specific content */}
        {user.role === 'organiser' && event.organiser_email === user.email && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Enrolled Startups
              </h2>
              {eventEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {eventEnrollments.map((enrollment, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-700 rounded border border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">
                          {enrollment.idea_name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            enrollment.status === 'shortlisted'
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        <strong>Startup:</strong> {enrollment.startup_email}
                      </p>
                      <p className="text-gray-300 text-sm mb-2">
                        {enrollment.idea_description}
                      </p>
                      <p className="text-gray-300 text-sm">
                        <strong>Team:</strong> {enrollment.team_details}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No startups enrolled yet.</p>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Access Requests
              </h2>
              {accessRequests.length > 0 ? (
                <div className="space-y-2">
                  {accessRequests.map((request, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-700 rounded flex justify-between items-center"
                    >
                      <span className="text-gray-300">{request.investor_email}</span>
                      <div className="flex space-x-2">
                        {request.approved ? (
                          <span className="px-3 py-1 bg-green-600 text-white text-sm rounded">
                            Approved
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleApproveAccess(request.investor_email, true)
                              }
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleApproveAccess(request.investor_email, false)
                              }
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No access requests yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EventDetails

