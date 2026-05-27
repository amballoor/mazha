import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Location from '@/pages/Location'

export default function App() {
  return (
    <BrowserRouter basename="/mazha">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/location/:slug" element={<Location />} />
      </Routes>
    </BrowserRouter>
  )
}
