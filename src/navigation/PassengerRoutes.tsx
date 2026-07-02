import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PassengerLayout from '../layouts/PassengerLayout';
import HomePage from '../pages/passenger/HomePage';
import SearchResultsPage from '../pages/passenger/SearchResultsPage';
import ScheduleDetailPage from '../pages/passenger/ScheduleDetailPage';
import CheckoutPage from '../pages/passenger/CheckoutPage';
import PaymentPage from '../pages/passenger/PaymentPage';
import TicketPage from '../pages/passenger/TicketPage';
import BookingHistoryPage from '../pages/passenger/BookingHistoryPage';
import ProfilePage from '../pages/passenger/ProfilePage';
import NewsPage from '../pages/passenger/NewsPage';
import AIChatPage from '../pages/passenger/AIChatPage';

function wrap(children: React.ReactNode) {
  return (
    <ProtectedRoute allowedRoles={['PASSENGER']}>
      <PassengerLayout>{children}</PassengerLayout>
    </ProtectedRoute>
  );
}

export default function PassengerRoutes() {
  return (
    <>
      <Route path="/home" element={wrap(<HomePage />)} />
      <Route path="/search-results" element={wrap(<SearchResultsPage />)} />
      <Route path="/schedule/:id" element={wrap(<ScheduleDetailPage />)} />
      <Route path="/checkout/:scheduleId" element={wrap(<CheckoutPage />)} />
      <Route path="/payment/:bookingId" element={wrap(<PaymentPage />)} />
      <Route path="/ticket/:bookingId" element={wrap(<TicketPage />)} />
      <Route path="/bookings" element={wrap(<BookingHistoryPage />)} />
      <Route path="/profile" element={wrap(<ProfilePage />)} />
      <Route path="/news" element={wrap(<NewsPage />)} />
      <Route path="/chat" element={wrap(<AIChatPage />)} />
    </>
  );
}
