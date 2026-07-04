import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './context/QueryContext';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <BrowserRouter future={{ v7_relativeSplatPath: true }}>
    <AuthProvider>
      <QueryProvider>
        <AppRoutes />
      </QueryProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
