import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard/index.jsx'
import PostIdea from './components/PostIdea'
import AdminDashboard from './components/AdminDashboard'
import ProjectApplicants from './components/ProjectApplicants'
import ViewProfile from './components/ViewProfile'
import LandingPage from './components/LandingPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/post-idea" element={<PostIdea />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<ViewProfile />} />
      <Route path="/profile/:id" element={<ViewProfile />} />
      <Route path="/project/:id/applicants" element={<ProjectApplicants />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
