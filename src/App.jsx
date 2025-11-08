import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebaseConfig';          // Correct, on garde
import { onAuthStateChanged } from 'firebase/auth'; // ON IMPORTE D'ICI

// --- Nos composants de page ---
import ConnexionLivreur from './components/ConnexionLivreur.jsx';
import InscriptionLivreur from './components/InscriptionLivreur.jsx';
import LivreurLayout from './layout/LivreurLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profil from './pages/Profil.jsx';
import LivraisonActive from './pages/LivraisonActive.jsx';
import Gains from './pages/Gains.jsx'; // 1. NOUVEL IMPORT

// --- Composant "Chargement" ---
function LoadingScreen() {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
}

function App() {
  // --- ÉTATS GLOBAUX ---
  const [estConnecte, setEstConnecte] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [commandeActive, setCommandeActive] = useState(null);

  // --- EFFET D'AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEstConnecte(!!user); // Met à true si 'user' existe, sinon false
      setLoadingAuth(false); // On a notre réponse, on arrête de charger
    });
    // Nettoie l'écouteur
    return () => unsubscribe();
  }, []);

  // --- GESTIONNAIRES D'ÉTAT ---
  const handleLoginSuccess = () => setEstConnecte(true);
  const handleLogout = () => setEstConnecte(false);
  
  const handlePrendreCommande = (commande) => {
    setCommandeActive(commande);
  };
  
  const handleCommandeTerminee = () => {
    setCommandeActive(null); 
  };

  // --- AFFICHAGE ---
  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      {/* LOGIQUE PRINCIPALE */}
      {estConnecte && commandeActive ? (
        
        <LivraisonActive 
          commande={commandeActive} 
          onCommandeTerminee={handleCommandeTerminee} 
        />

      ) : (
        
        <Routes>
          
          {/* --- Routes Publiques --- */}
          <Route 
            path="/login" 
            element={
              !estConnecte ? 
              <ConnexionLivreur onLoginSuccess={handleLoginSuccess} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/signup" 
            element={
              !estConnecte ? 
              <InscriptionLivreur /> : 
              <Navigate to="/dashboard" />
            } 
          />

          {/* --- Routes Protégées (Layout) --- */}
          <Route 
            path="/" 
            element={
              estConnecte ? 
              <LivreurLayout /> : 
              <Navigate to="/login" />
            }
          >
            {/* Les pages dans l'Outlet */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={<Dashboard onPrendreCommande={handlePrendreCommande} />} 
            />
            
            {/* 2. NOUVELLE ROUTE AJOUTÉE ICI */}
            <Route 
              path="gains" 
              element={<Gains />} 
            />
            
            <Route 
              path="profil" 
              element={<Profil onLogout={handleLogout} />} 
            />
          </Route>

          {/* --- Redirection --- */}
          <Route 
            path="*" 
            element={<Navigate to={estConnecte ? "/dashboard" : "/login"} />} 
          />

        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;