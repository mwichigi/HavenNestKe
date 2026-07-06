import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Load saved language on startup
window.__nestLang = localStorage.getItem('nestkenya_lang') || 'en';

import HomePage           from './pages/HomePage';
import LandlordDashboard  from './pages/landlord/LandlordDashboard';
import AdminPage          from './pages/AdminPage';
import MapPage            from './pages/MapPage';
import RentPaymentPage    from './pages/RentPaymentPage';
import MaintenancePage    from './pages/MaintenancePage';
import ProfilePage        from './pages/ProfilePage';
import PersonalDetailsPage from './pages/PersonalDetailsPage';
import RentalHistoryPage  from './pages/RentalHistoryPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import NotificationsPage  from './pages/NotificationsPage';
import PrivacyPage        from './pages/PrivacyPage';
import LanguagePage       from './pages/LanguagePage';

import { SplashPage, OnboardingPage, LoginPage, RegisterPage, PropertyDetailPage, LeasePage, MovingServicesPage } from './pages/AllPages';

const HomeRouter = () => {
  const { user } = useAuth();
  const landlordRoles = ['landlord', 'developer', 'agency'];
  if (user && landlordRoles.includes(user.role)) {
    return <LandlordDashboard />;
  }
  return <HomePage />;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Loading NestKenya...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"           element={<SplashPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />

          <Route path="/home"         element={<ProtectedRoute><HomeRouter /></ProtectedRoute>} />
          <Route path="/map"          element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/property/:id" element={<ProtectedRoute><PropertyDetailPage /></ProtectedRoute>} />
          <Route path="/lease/:id"    element={<ProtectedRoute><LeasePage /></ProtectedRoute>} />
          <Route path="/rent"         element={<ProtectedRoute><RentPaymentPage /></ProtectedRoute>} />
          <Route path="/maintenance"  element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
          <Route path="/moving"       element={<ProtectedRoute><MovingServicesPage /></ProtectedRoute>} />

          <Route path="/profile"                  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/personal-details" element={<ProtectedRoute><PersonalDetailsPage /></ProtectedRoute>} />
          <Route path="/profile/rental-history"   element={<ProtectedRoute><RentalHistoryPage /></ProtectedRoute>} />
          <Route path="/profile/payment-methods"  element={<ProtectedRoute><PaymentMethodsPage /></ProtectedRoute>} />
          <Route path="/profile/notifications"    element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile/language"         element={<ProtectedRoute><LanguagePage /></ProtectedRoute>} />
          <Route path="/profile/privacy"          element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
