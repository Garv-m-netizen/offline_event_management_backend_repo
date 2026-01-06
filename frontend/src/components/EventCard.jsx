import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const EventCard = ({ event }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleCardClick = () => {
    navigate(`/events/${encodeURIComponent(event.name)}`)
  }

  const statusColor =
    event.status === 'upcoming'
      ? 'bg-green-600'
      : 'bg-gray-600'

  return (
    <div
      onClick={handleCardClick}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-700"
    >
      <div className="h-48 bg-gray-700 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=Event+Image'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white truncate">
            {event.name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColor}`}
          >
            {event.status}
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="text-sm text-gray-500">
          <p>
            {new Date(event.event_datetime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EventCard

