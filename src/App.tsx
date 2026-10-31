import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import SolarSite from './pages/SolarSite'

// The forum is its own chunk: the cinematic site never downloads it unless a visitor goes there.
const ForumHome = lazy(() => import('./pages/forum/ForumHome'))
const ForumSectionPage = lazy(() => import('./pages/forum/ForumSectionPage'))
const ForumTopicPage = lazy(() => import('./pages/forum/ForumTopicPage'))
const ForumNewTopicPage = lazy(() => import('./pages/forum/ForumNewTopicPage'))

const forumFallback = <div className="min-h-svh bg-[#fff8ee]" />

export default function App() {
  return (
    <Suspense fallback={forumFallback}>
      <Routes>
        <Route path="/" element={<SolarSite />} />
        <Route path="/forum" element={<ForumHome />} />
        <Route path="/forum/s/:sectionId" element={<ForumSectionPage />} />
        <Route path="/forum/t/:number" element={<ForumTopicPage />} />
        <Route path="/forum/new" element={<ForumNewTopicPage />} />
        <Route path="*" element={<SolarSite />} />
      </Routes>
    </Suspense>
  )
}
