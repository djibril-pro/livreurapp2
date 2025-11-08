import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebaseConfig';                 // Correct, on garde
import { onAuthStateChanged } from 'firebase/auth';      // ON IMPORTE D'ICI

// --- Nos composants de page ---
import ConnexionLivreur from './components/ConnexionLivreur.jsx';
import InscriptionLivreur from './components/InscriptionLivreur.jsx';
import LivreurLayout from './layout/LivreurLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profil from './pages/Profil.jsx';
import LivraisonActive from './pages/LivraisonActive.jsx';

// --- Composant "Chargement" ---
function LoadingScreen() {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
}

function App() {
  // --- ÉTATS GLOBAUX ---
  // 1. Gère si l'utilisateur est connecté
  const [estConnecte, setEstConnecte] = useState(false);
  // 2. Gère si on attend la réponse de Firebase au chargement
  const [loadingAuth, setLoadingAuth] = useState(true);
  // 3. Gère la commande en cours (le plus important !)
  const [commandeActive, setCommandeActive] = useState(null);

  // --- EFFET D'AUTH ---
  // Surveille l'état de connexion de l'utilisateur au démarrage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEstConnecte(!!user); // Met à true si 'user' existe, sinon false
      setLoadingAuth(false); // On a notre réponse, on arrête de charger
    });
    // Nettoie l'écouteur
    return () => unsubscribe();
  }, []);

  // --- GESTIONNAIRES D'ÉTAT (que l'on passera aux enfants) ---
  const handleLoginSuccess = () => setEstConnecte(true);
  const handleLogout = () => setEstConnecte(false);
  
  // Quand le livreur accepte une commande sur le Dashboard
  const handlePrendreCommande = (commande) => {
    setCommandeActive(commande);
  };
  
  // Quand le livreur termine sa course sur LivraisonActive
  const handleCommandeTerminee = () => {
    setCommandeActive(null); // On vide la commande, ce qui le renverra au Dashboard
  };

  // --- AFFICHAGE ---
  // Si on attend encore la réponse de Firebase, on affiche un écran de chargement
  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      {/* LOGIQUE PRINCIPALE :
        Si l'utilisateur est connecté ET qu'il a une commande active,
        on affiche TOUJOURS la page LivraisonActive, peu importe l'URL.
      */}
      {estConnecte && commandeActive ? (
        
        <LivraisonActive 
          commande={commandeActive} 
          onCommandeTerminee={handleCommandeTerminee} 
        />

      ) : (
        
        /* Sinon, on affiche le routeur normal
          (soit les pages de connexion, soit le layout du livreur)
        */
        <Routes>
          
          {/* --- Routes Publiques (pour les non-connectés) --- */}
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

          {/* --- Routes Protégées (pour les connectés SANS commande) --- */}
          <Route 
            path="/" 
            element={
              estConnecte ? 
              <LivreurLayout /> : // Le layout qui contient la nav et l'Outlet
              <Navigate to="/login" />
            }
          >
            {/* Les pages qui s'afficheront dans l'Outlet du Layout */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              element={<Dashboard onPrendreCommande={handlePrendreCommande} />} 
            />
            <Route 
              path="profil" 
              element={<Profil onLogout={handleLogout} />} 
            />
          </Route>

          {/* --- Redirection pour toutes les autres routes --- */}
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