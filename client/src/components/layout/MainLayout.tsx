import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { PageLoader } from './PageLoader'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-mesh">
      <Navbar />
      <PageLoader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
