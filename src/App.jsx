import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
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
import SideBar from './components/layout/SideBar'
import ScrollToTop from './components/layout/ScrollTotop'

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar />
      <main style={{ flex: 1, background: '#f7f9fc' }}>
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
    element: <Organizations />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/org/:orgId',
    element: <Layout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'posts', element: <Posts /> },
      { path: 'posts/create', element: <CreatePost /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'team', element: <Team /> },
      { path: 'settings', element: <Settings /> },
      { path: 'socials/klm', element: <Klm /> },
      { path: 'socials/kls', element: <Kls /> },
      { path: 'socials/klc', element: <Klc /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
