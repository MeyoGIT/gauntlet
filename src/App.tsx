import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import OBS from './pages/OBS'
import PasswordGate from './components/PasswordGate'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PasswordGate><Home /></PasswordGate>} />
        <Route path="/obs" element={<OBS />} />
      </Routes>
    </BrowserRouter>
  )
}
