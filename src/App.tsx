import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Atmosphere } from './components/Atmosphere'
import { BagDrawer } from './components/BagDrawer'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { GalleryCanvas } from './three/GalleryCanvas'
import { Home } from './pages/Home'
import { ProductPage } from './pages/ProductPage'
import { BagProvider } from './store/BagContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/') window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BagProvider>
      <div className="relative min-h-screen bg-ink text-bone">
        <Atmosphere />
        <GalleryCanvas />
        <ScrollToTop />
        <Header />
        <AnimatedRoutes />
        <Footer />
        <BagDrawer />
      </div>
    </BagProvider>
  )
}
