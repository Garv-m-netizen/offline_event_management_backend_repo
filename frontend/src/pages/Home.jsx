import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Offline Event Management Platform
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Connect Organisers, Startups, and Investors
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 font-medium"
              >
                Login
              </Link>
            </div>
          )}
          {user && (
            <Link
              to={
                user.role === 'organiser'
                  ? '/organiser/dashboard'
                  : user.role === 'startup'
                  ? '/startup/dashboard'
                  : '/investor/dashboard'
              }
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home

