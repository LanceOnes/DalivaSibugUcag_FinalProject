import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { MenuPage } from '@/pages/MenuPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { OrderSuccessPage } from '@/pages/OrderSuccessPage'
import { OrderHistoryPage } from '@/pages/OrderHistoryPage'
import { AccountProfilePage } from '@/pages/AccountProfilePage'
import { AccountLayout } from '@/components/layout/AccountLayout'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminSchedulePage } from '@/pages/admin/AdminSchedulePage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="order-success/:orderNumber" element={<OrderSuccessPage />} />
        <Route
          path="account"
          element={
            <ProtectedRoute role="customer">
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountProfilePage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
        </Route>
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route
        path="admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="schedule" element={<AdminSchedulePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  )
}
