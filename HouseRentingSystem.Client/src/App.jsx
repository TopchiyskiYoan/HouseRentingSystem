import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import PropertyPage from './pages/PropertyPage'
import CreateHousePage from './pages/CreateHousePage'
import EditHousePage from './pages/EditHousePage'
import MyListingsPage from './pages/MyListingsPage'
import Layout from './components/Layout'
import { useAuth } from './context/AuthContext'

function AgentRoute({ children }) {
  const { isAuthenticated, isAgent } = useAuth()
  if (!isAuthenticated || !isAgent) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyPage />} />
          <Route path="/property/:id/edit" element={<AgentRoute><EditHousePage /></AgentRoute>} />
          <Route path="/create" element={<AgentRoute><CreateHousePage /></AgentRoute>} />
          <Route path="/my-listings" element={<AgentRoute><MyListingsPage /></AgentRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
