import React, { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { supabase } from './supabase/supabase'
import Login from './pages/Login'
import Organizations from './pages/Organizations'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Posts from './pages/Posts'
import Quiz from './pages/Quiz'
import Settings from './pages/Settings'
import Team from './pages/Team'
import CreatePost from './pages/CreatePost'
import Klm from './pages/socials/Klm'
import Kls from './pages/socials/Kls'
import Klc from './pages/socials/Klc'
import DonePosting from './pages/DonePosting'
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
      { path: 'posts', element: <Posts /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'team', element: <Team /> },
      { path: 'settings', element: <Settings /> },
      { path: 'socials/klm', element: <Klm /> },
      { path: 'socials/kls', element: <Kls /> },
      { path: 'socials/klc', element: <Klc /> },
      { path: 'done-posting', element: <DonePosting /> },
    ],
  },
  {
    path: '/org/:orgId/posts/create',
    element: <ProtectedRoute><CreatePost /></ProtectedRoute>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
