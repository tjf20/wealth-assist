import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import HomeView from './views/HomeView.jsx'
import TodayView from './views/TodayView.jsx'
import ClientsView from './views/ClientsView.jsx'
import ClientDetailView from './views/ClientDetailView.jsx'
import ReportsView from './views/ReportsView.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/"            element={<HomeView />} />
        <Route path="/today"       element={<TodayView />} />
        <Route path="/clients"     element={<ClientsView />} />
        <Route path="/clients/:id" element={<ClientDetailView />} />
        <Route path="/reports"     element={<ReportsView />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
