import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const AppContent = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Dashboard /> : <Register />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
