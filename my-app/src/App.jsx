//  Top Level Layout Component including navigation and routes
import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Test from './pages/Test.jsx'

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/test">Test</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </>
  )
}

