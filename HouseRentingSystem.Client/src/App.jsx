import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import PropertyPage from './pages/PropertyPage'
import CreateHousePage from './pages/CreateHousePage'
import EditHousePage from './pages/EditHousePage'
import MyListingsPage from './pages/MyListingsPage'
import Layout from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/property/:id" element={<PropertyPage />} />
          <Route path="/property/:id/edit" element={<EditHousePage />} />
          <Route path="/create" element={<CreateHousePage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
