import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Admin } from './pages/Admin/Admin';
import { CreateGift } from './pages/Admin/CreateGift';
import { EditGift } from './pages/Admin/EditGift';
import { AdminSettings } from './pages/Admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/presentes/novo"
          element={
            <ProtectedRoute>
              <CreateGift />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/presentes/:id/editar"
          element={
            <ProtectedRoute>
              <EditGift />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configuracoes"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
