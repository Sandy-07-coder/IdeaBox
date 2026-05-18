import React, { useEffect } from 'react'
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useUserStore } from './store'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard/index.jsx'
import PostIdea from './components/PostIdea'
import AdminDashboard from './components/AdminDashboard'
import ProjectApplicants from './components/ProjectApplicants'
import ViewProfile from './components/ViewProfile'
import LandingPage from './components/LandingPage'

function App() {
  const { fetchUser, clearUser } = useUserStore()

  useEffect(() => {
    // Initial fetch
    fetchUser(true)

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        fetchUser(true)
      } else if (event === 'SIGNED_OUT') {
        clearUser()
      }
    })

    // Listen for tab focus/visibility to refresh user state
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchUser(true)
    }
    const handleFocus = () => fetchUser(true)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchUser, clearUser])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Navigate to="/dashboard/marketplace" replace />} />
      <Route path="/dashboard/:tab" element={<Dashboard />} />
      <Route path="/dashboard/:tab/:itemId" element={<Dashboard />} />
      <Route path="/post-idea" element={<PostIdea />} />
      <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
      <Route path="/admin/:tab" element={<AdminDashboard />} />
      <Route path="/admin/:tab/:itemId" element={<AdminDashboard />} />
      <Route path="/profile" element={<ViewProfile />} />
      <Route path="/profile/:id" element={<ViewProfile />} />
      <Route path="/project/:id/applicants" element={<ProjectApplicants />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
