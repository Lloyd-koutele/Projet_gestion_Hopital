// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './auth/Login.jsx';
import Home from './Page/Home.jsx';
import { isAuthenticated, getUserRole } from './auth/authService';
import AdminDashboard from './Admin/AdminDasboard.jsx';

// Composant pour protéger les routes
const PrivateRoute = ({ children, requiredRole = null }) => {

  if (requiredRole && getUserRole() !== requiredRole) {
    // Redirige vers la page principale du rôle actuel
    const role = getUserRole().toLowerCase();
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

// Définition du routeur
const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },

  // Pages protégées par rôle
  {
    path: '/admin', element:
      <PrivateRoute requiredRole="ADMIN">
        <AdminDashboard />
      </PrivateRoute>
  },
  { path: '/medecin', element: <PrivateRoute requiredRole="MEDECIN"><div>Page Médecin</div></PrivateRoute> },
  { path: '/patient', element: <PrivateRoute requiredRole="PATIENT"><div>Page Patient</div></PrivateRoute> },
  { path: '/chercheur', element: <PrivateRoute requiredRole="CHERCHEUR"><div>Page Chercheur</div></PrivateRoute> },
]);

// App principal
function App() {
  return <RouterProvider router={router} />;
}

export default App;
