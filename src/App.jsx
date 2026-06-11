import React, { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { supabase } from './supabase/supabase'
import Login from './pages/Login'
import Organizations from './pages/Organizations'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Posts from './pages/Posts'
import Blogs from './pages/Blogs'
import Quiz from './pages/Quiz'
import Settings from './pages/Settings'
import CreatePost from './pages/CreatePost'
import CreateBlog from './pages/CreateBlog'
import Published from './pages/Published'
import SideBar from './components/layout/SideBar'
import ScrollToTop from './components/layout/ScrollTotop'

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-brand font-extrabold font-sans">
        Authenticating...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-light-bg">
      <SideBar />
      <main className="flex-1 bg-light-bg">
        <ScrollToTop />
        <Outlet />
      </main>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/organizations',
    element: <ProtectedRoute><Organizations /></ProtectedRoute>,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/org/:orgId',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'carousels', element: <Posts postType="carousel" /> },
      { path: 'reels', element: <Posts postType="reel" /> },
      { path: 'blogs', element: <Blogs /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'settings', element: <Settings /> },
      { path: 'published', element: <Published /> },
    ],
  },
  {
    path: '/org/:orgId/carousels/create',
    element: <ProtectedRoute><CreatePost defaultType="carousel" /></ProtectedRoute>,
  },
  {
    path: '/org/:orgId/reels/create',
    element: <ProtectedRoute><CreatePost defaultType="reel" /></ProtectedRoute>,
  },
  {
    path: '/org/:orgId/blogs/create',
    element: <ProtectedRoute><CreateBlog /></ProtectedRoute>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
