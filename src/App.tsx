import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import OBS from './pages/OBS'
import { AdminProvider } from './contexts/AdminContext'

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/obs" element={<OBS />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  )
}
