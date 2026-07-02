import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PassengerLayout from './layouts/PassengerLayout';
import AdminLayout     from './layouts/AdminLayout';
import AgencyLayout    from './layouts/AgencyLayout';

// Public pages
import HomePage    from './pages/public/HomePage';
import PricesPage  from './pages/public/PricesPage';
import AboutPage   from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Passenger
import PassengerHomePage  from './pages/passenger/HomePage';
import BookingHistoryPage from './pages/passenger/BookingHistoryPage';
import SearchResultsPage  from './pages/passenger/SearchResultsPage';
import CheckoutPage       from './pages/passenger/CheckoutPage';
import PaymentPage        from './pages/passenger/PaymentPage';
import TicketPage         from './pages/passenger/TicketPage';
import ScheduleDetailPage from './pages/passenger/ScheduleDetailPage';
import ProfilePage        from './pages/passenger/ProfilePage';
import AIChatPage         from './pages/passenger/AIChatPage';
import NewsPage           from './pages/passenger/NewsPage';

// Admin
import AdminDashboardPage    from './pages/admin/AdminDashboardPage';
import AdminProfilePage      from './pages/admin/AdminProfilePage';
import AgenciesPage          from './pages/admin/AgenciesPage';
import AgencyStationLinkPage from './pages/admin/AgencyStationLinkPage';
import StationsPage          from './pages/admin/StationsPage';
import UsersPage             from './pages/admin/UsersPage';
import ReportsPage           from './pages/admin/ReportsPage';

// Agency
import AgencyDashboardPage from './pages/agency/AgencyDashboardPage';
import AgencyProfilePage   from './pages/agency/AgencyProfilePage';
import AgencyBookingsPage  from './pages/agency/BookingsPage';
import BusesPage           from './pages/agency/BusesPage';
import DriversPage         from './pages/agency/DriversPage';
import AgencyReportsPage   from './pages/agency/ReportsPage';
import RoutesPage          from './pages/agency/RoutesPage';
import SchedulesPage       from './pages/agency/SchedulesPage';

import DriverLayout          from './layouts/DriverLayout';
import DriverDashboardPage   from './pages/driver/DriverDashboardPage';
import DriverSchedulePage    from './pages/driver/DriverSchedulePage';
import DriverPassengersPage  from './pages/driver/DriverPassengersPage';
import DriverScanPage        from './pages/driver/DriverScanPage';
import DriverReportsPage     from './pages/driver/DriverReportsPage';
import DriverProfilePage     from './pages/driver/DriverProfilePage';

// 404
import NotFoundPage from './pages/PublicPages/NotFoundPage';

// ── Layout wrappers ──────────────────────────────────────────────
function PL({ children }: { children: React.ReactNode }) {
  return <PassengerLayout>{children}</PassengerLayout>;
}
function AL({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
function AGL({ children }: { children: React.ReactNode }) {
  return <AgencyLayout>{children}</AgencyLayout>;
}
function DL({ children }: { children: React.ReactNode }) {
  return <DriverLayout>{children}</DriverLayout>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public (unauthenticated) ── */}
          <Route path="/"        element={<HomePage />} />
          <Route path="/prices"  element={<PricesPage />} />
          <Route path="/about"   element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* ── Auth ── */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Passenger pages ── */}
          <Route path="/home"              element={<PL><PassengerHomePage /></PL>} />
          <Route path="/bookings"          element={<PL><BookingHistoryPage /></PL>} />
          <Route path="/search"            element={<PL><SearchResultsPage /></PL>} />
          <Route path="/search-results"    element={<PL><SearchResultsPage /></PL>} />
          <Route path="/checkout"          element={<PL><CheckoutPage /></PL>} />
          <Route path="/checkout/:id"      element={<PL><CheckoutPage /></PL>} />
          <Route path="/payment"           element={<PL><PaymentPage /></PL>} />
          <Route path="/payment/:bookingId" element={<PL><PaymentPage /></PL>} />
          <Route path="/ticket/:id"        element={<PL><TicketPage /></PL>} />
          <Route path="/ticket/:bookingId" element={<PL><TicketPage /></PL>} />
          <Route path="/schedule/:id"      element={<PL><ScheduleDetailPage /></PL>} />
          <Route path="/profile"           element={<PL><ProfilePage /></PL>} />
          <Route path="/chat"              element={<PL><AIChatPage /></PL>} />
          <Route path="/news"              element={<PL><NewsPage /></PL>} />

          {/* Passenger — shared pages inside dashboard */}
          <Route path="/passenger/prices"  element={<PL><PricesPage /></PL>} />
          <Route path="/passenger/about"   element={<PL><AboutPage /></PL>} />
          <Route path="/passenger/contact" element={<PL><ContactPage /></PL>} />

          {/* ── Admin pages ── */}
          <Route path="/admin/dashboard"       element={<AL><AdminDashboardPage /></AL>} />
          <Route path="/admin/profile"         element={<AL><AdminProfilePage /></AL>} />
          <Route path="/admin/agencies"        element={<AL><AgenciesPage /></AL>} />
          <Route path="/admin/agency-stations" element={<AL><AgencyStationLinkPage /></AL>} />
          <Route path="/admin/stations"        element={<AL><StationsPage /></AL>} />
          <Route path="/admin/users"           element={<AL><UsersPage /></AL>} />
          <Route path="/admin/reports"         element={<AL><ReportsPage /></AL>} />

          {/* Admin — shared pages inside dashboard */}
          <Route path="/admin/prices"   element={<AL><PricesPage /></AL>} />
          <Route path="/admin/about"    element={<AL><AboutPage /></AL>} />
          <Route path="/admin/contact"  element={<AL><ContactPage /></AL>} />

          {/* ── Agency pages ── */}
          <Route path="/agency/dashboard" element={<AGL><AgencyDashboardPage /></AGL>} />
          <Route path="/agency/profile"   element={<AGL><AgencyProfilePage /></AGL>} />
          <Route path="/agency/bookings"  element={<AGL><AgencyBookingsPage /></AGL>} />
          <Route path="/agency/buses"     element={<AGL><BusesPage /></AGL>} />
          <Route path="/agency/drivers"   element={<AGL><DriversPage /></AGL>} />
          <Route path="/agency/reports"   element={<AGL><AgencyReportsPage /></AGL>} />
          <Route path="/agency/routes"    element={<AGL><RoutesPage /></AGL>} />
          <Route path="/agency/schedules" element={<AGL><SchedulesPage /></AGL>} />

          {/* Agency — shared pages inside dashboard */}
          <Route path="/agency/prices"   element={<AGL><PricesPage /></AGL>} />
          <Route path="/agency/about"    element={<AGL><AboutPage /></AGL>} />
          <Route path="/agency/contact"  element={<AGL><ContactPage /></AGL>} />

          {/* ── Driver pages ── */}
          <Route path="/driver/dashboard"              element={<DL><DriverDashboardPage /></DL>} />
          <Route path="/driver/schedule"               element={<DL><DriverSchedulePage /></DL>} />
          <Route path="/driver/passengers"             element={<DL><DriverPassengersPage /></DL>} />
          <Route path="/driver/passengers/:scheduleId" element={<DL><DriverPassengersPage /></DL>} />
          <Route path="/driver/scan"                   element={<DL><DriverScanPage /></DL>} />
          <Route path="/driver/reports"                element={<DL><DriverReportsPage /></DL>} />
          <Route path="/driver/profile"                element={<DL><DriverProfilePage /></DL>} />

          {/* Driver — shared public pages inside dashboard */}
          <Route path="/driver/prices"     element={<DL><PricesPage /></DL>} />
          <Route path="/driver/about"      element={<DL><AboutPage /></DL>} />
          <Route path="/driver/contact"    element={<DL><ContactPage /></DL>} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;