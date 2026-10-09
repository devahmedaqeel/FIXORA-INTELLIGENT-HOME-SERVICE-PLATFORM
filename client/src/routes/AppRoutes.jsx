import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import Loader from '../components/common/Loader';

/* Pages are code-split per route. */
const page = (loader) => lazy(loader);

// Public
const Home = page(() => import('../pages/public/Home'));
const About = page(() => import('../pages/public/About'));
const Services = page(() => import('../pages/public/Services'));
const ServiceSearch = page(() => import('../pages/public/ServiceSearch'));
const ProviderProfile = page(() => import('../pages/public/ProviderProfile'));
const Login = page(() => import('../pages/public/Login'));
const Register = page(() => import('../pages/public/Register'));
const ForgotPassword = page(() => import('../pages/public/ForgotPassword'));
const Terms = page(() => import('../pages/public/Terms'));
const Privacy = page(() => import('../pages/public/Privacy'));
const Contact = page(() => import('../pages/public/Contact'));
const Unauthorized = page(() => import('../pages/public/Unauthorized'));
const NotFound = page(() => import('../pages/public/NotFound'));

// Customer
const CustomerDashboard = page(() => import('../pages/customer/CustomerDashboard'));
const CustomerProfile = page(() => import('../pages/customer/CustomerProfile'));
const SearchServices = page(() => import('../pages/customer/SearchServices'));
const ProviderDetails = page(() => import('../pages/customer/ProviderDetails'));
const BookingPage = page(() => import('../pages/customer/BookingPage'));
const MyBookings = page(() => import('../pages/customer/MyBookings'));
const BookingDetails = page(() => import('../pages/customer/BookingDetails'));
const SavedProviders = page(() => import('../pages/customer/SavedProviders'));
const Reviews = page(() => import('../pages/customer/Reviews'));
const CustomerNotifications = page(() => import('../pages/customer/CustomerNotifications'));
const CustomerComplaints = page(() => import('../pages/customer/CustomerComplaints'));

// Provider
const ProviderDashboard = page(() => import('../pages/provider/ProviderDashboard'));
const ProviderProfilePage = page(() => import('../pages/provider/ProviderProfile'));
const ProviderServices = page(() => import('../pages/provider/ProviderServices'));
const AddService = page(() => import('../pages/provider/AddService'));
const EditService = page(() => import('../pages/provider/EditService'));
const ProviderAvailability = page(() => import('../pages/provider/ProviderAvailability'));
const ProviderBookings = page(() => import('../pages/provider/ProviderBookings'));
const ProviderBookingDetails = page(() => import('../pages/provider/ProviderBookingDetails'));
const ProviderReviews = page(() => import('../pages/provider/ProviderReviews'));
const ProviderEarnings = page(() => import('../pages/provider/ProviderEarnings'));
const ProviderCommissions = page(() => import('../pages/provider/ProviderCommissions'));
const ProviderCommissionDetails = page(() => import('../pages/provider/ProviderCommissionDetails'));
const ProviderSettings = page(() => import('../pages/provider/ProviderSettings'));
const ProviderNotifications = page(() => import('../pages/provider/ProviderNotifications'));
const ProviderComplaints = page(() => import('../pages/provider/ProviderComplaints'));
const ProviderOnboarding = page(() => import('../pages/provider/ProviderOnboarding'));

// Admin
const AdminLogin = page(() => import('../pages/admin/AdminLogin'));
const AdminSignup = page(() => import('../pages/admin/AdminSignup'));
const AdminTeam = page(() => import('../pages/admin/AdminTeam'));
const AdminDashboard = page(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = page(() => import('../pages/admin/ManageUsers'));
const ManageCustomers = page(() => import('../pages/admin/ManageCustomers'));
const ManageProviders = page(() => import('../pages/admin/ManageProviders'));
const ProviderVerification = page(() => import('../pages/admin/ProviderVerification'));
const ManageCategories = page(() => import('../pages/admin/ManageCategories'));
const ManageAreas = page(() => import('../pages/admin/ManageAreas'));
const ManageBookings = page(() => import('../pages/admin/ManageBookings'));
const ManageReviews = page(() => import('../pages/admin/ManageReviews'));
const ManageComplaints = page(() => import('../pages/admin/ManageComplaints'));
const Reports = page(() => import('../pages/admin/Reports'));
const ChatbotQueries = page(() => import('../pages/admin/ChatbotQueries'));
const AdminSettings = page(() => import('../pages/admin/AdminSettings'));
const AdminPayments = page(() => import('../pages/admin/AdminPayments'));
const AdminCommissions = page(() => import('../pages/admin/AdminCommissions'));
const AdminCommissionDetail = page(() => import('../pages/admin/AdminCommissionDetail'));
const AdminFinancialReports = page(() => import('../pages/admin/AdminFinancialReports'));
const AdminAuditLogs = page(() => import('../pages/admin/AdminAuditLogs'));
const AdminPaymentSettings = page(() => import('../pages/admin/AdminPaymentSettings'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="search" element={<ServiceSearch />} />
          <Route path="providers/:id" element={<ProviderProfile />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="contact" element={<Contact />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route element={<AuthLayout />}>
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
        </Route>

        <Route path="customer" element={<ProtectedRoute roles={['customer']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="search" element={<SearchServices />} />
            <Route path="providers/:id" element={<ProviderDetails />} />
            <Route path="book/:providerId" element={<BookingPage />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="saved" element={<SavedProviders />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="complaints" element={<CustomerComplaints />} />
          </Route>
        </Route>

        <Route path="provider" element={<ProtectedRoute roles={['provider']} />}>
          <Route path="onboarding" element={<ProviderOnboarding />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="profile" element={<ProviderProfilePage />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="services/new" element={<AddService />} />
            <Route path="services/:id/edit" element={<EditService />} />
            <Route path="availability" element={<ProviderAvailability />} />
            <Route path="bookings" element={<ProviderBookings />} />
            <Route path="bookings/:id" element={<ProviderBookingDetails />} />
            <Route path="reviews" element={<ProviderReviews />} />
            <Route path="earnings" element={<ProviderEarnings />} />
            <Route path="commissions" element={<ProviderCommissions />} />
            <Route path="commissions/:id" element={<ProviderCommissionDetails />} />
            <Route path="settings" element={<ProviderSettings />} />
            <Route path="notifications" element={<ProviderNotifications />} />
            <Route path="complaints" element={<ProviderComplaints />} />
          </Route>
        </Route>

        {/* Admin portal — entirely separate auth pages and layout from customer/provider. */}
        <Route path="admin">
          <Route element={<GuestRoute />}>
            <Route path="login" element={<AdminLogin />} />
            <Route path="signup" element={<AdminSignup />} />
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} loginPath="/admin/login" />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="customers" element={<ManageCustomers />} />
              <Route path="providers" element={<ManageProviders />} />
              <Route path="provider-verification" element={<ProviderVerification />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="areas" element={<ManageAreas />} />
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="reviews" element={<ManageReviews />} />
              <Route path="complaints" element={<ManageComplaints />} />
              <Route path="reports" element={<Reports />} />
              <Route path="chatbot-queries" element={<ChatbotQueries />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="commissions" element={<AdminCommissions />} />
              <Route path="commissions/:id" element={<AdminCommissionDetail />} />
              <Route path="financial-reports" element={<AdminFinancialReports />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="payment-settings" element={<AdminPaymentSettings />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
