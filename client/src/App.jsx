import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import { Routes, Route, Link } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </div>
  )
}
