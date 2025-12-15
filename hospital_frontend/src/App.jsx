import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import MedecinDashboard from './components/MedecinDashboard.jsx';
import ChercheurDashboard from './components/ChercheurDashboard.jsx';
import PatientDashboard from './components/PatientDashboard/PatientDashboard.jsx';
import GestionAcces from './components/PatientDashboard/GestionAcces.jsx';
import MesRendezVous from './components/PatientDashboard/MesRendezVous.jsx';
import Login from './auth/Login.jsx';
import { isAuthenticated, getUserRole } from './auth/authService';
import DossierMedicalPage from './pages/DossierMedicalPage.jsx';
import RendezVousPage from './pages/RendezVousPage.jsx';


function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container" style={{
      textAlign: 'center',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      marginTop: '2rem'
    }}>
      <h1 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
        Bienvenue sur la plateforme de gestion hospitalière
      </h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Connectez-vous pour accéder à votre espace personnel.
      </p>
      <button
        onClick={() => window.location.href = '/login'}
        style={{
          padding: '0.8rem 2rem',
          fontSize: '1.1rem',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        Se connecter
      </button>
    </div>
  );
}

// Composant de protection des routes
function PrivateRoute({ children, requiredRole = null }) {
  console.log('PrivateRoute - Vérification de l\'authentification');
  console.log('isAuthenticated() =', isAuthenticated());
  console.log('Token actuel =', localStorage.getItem('token'));
  console.log('Rôle actuel =', localStorage.getItem('userRole'));
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Si un rôle spécifique est requis, vérifier que l'utilisateur a ce rôle
  if (requiredRole && getUserRole() !== requiredRole) {
    // Rediriger vers la page d'accueil du rôle actuel de l'utilisateur
    const currentRole = getUserRole().toLowerCase();
    return <Navigate to={`/${currentRole}`} replace />;
  }
  
  // L'utilisateur est authentifié et a le bon rôle
  return children;
}

// Définition du routeur
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className="App">
        <Navbar />
        <Home />
      </div>
    ),
  },
  {
    path: '/login',
    element: (
      <div className="App">
        <Navbar />
        <Login />
      </div>
    ),
  },
  {
    path: '/admin',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="ADMIN">
          <AdminDashboard />
        </PrivateRoute>
      </div>
    ),
  },

  {
    path: '/medecin',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="MEDECIN">
          <MedecinDashboard />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/patient',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="PATIENT">
          <PatientDashboard />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/patient/dossier',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="PATIENT">
          <DossierMedicalPage />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/patient/consultations',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute>
          <DossierMedicalPage />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/patient/acces',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="PATIENT">
          <GestionAcces />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/patient/rendez-vous',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="PATIENT">
          <MesRendezVous />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/medecin/rendez-vous',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="MEDECIN">
          <RendezVousPage />
        </PrivateRoute>
      </div>
    ),
  },
  {
    path: '/dossier-medical/:patientId',
    element: (
      <div className="App">
        <Navbar />
        <PrivateRoute requiredRole="MEDECIN">
          <DossierMedicalPage />
        </PrivateRoute>
      </div>
    ),
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
