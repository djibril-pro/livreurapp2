import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { getProfilLivreur } from './services/CommandeService.js'; // <-- 1. IMPORTER LE SERVICE

// ... (tous vos imports de composants : ConnexionLivreur, Dashboard, etc.)
import ConnexionLivreur from './components/ConnexionLivreur.jsx';
import InscriptionLivreur from './components/InscriptionLivreur.jsx';
import LivreurLayout from './layout/LivreurLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profil from './pages/Profil.jsx';
import Gains from './pages/Gains.jsx';
import LivraisonActive from './pages/LivraisonActive.jsx';

function LoadingScreen() {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>;
}

function App() {
  // --- ÉTATS GLOBAUX ---
  const [estConnecte, setEstConnecte] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [commandeActive, setCommandeActive] = useState(null);
  
  // 2. L'ÉTAT EST MAINTENANT ICI
  const [statutLivreur, setStatutLivreur] = useState('Hors Ligne'); 

  // --- EFFET D'AUTH (Modifié) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEstConnecte(true);
        // 3. On récupère le statut gardé dans Firebase
        try {
          const profilDoc = await getProfilLivreur(user.uid);
          if (profilDoc.exists()) {
            setStatutLivreur(profilDoc.data().statut || 'Hors Ligne');
          }
        } catch (error) {
          console.error("Erreur récupération statut:", error);
          setStatutLivreur('Hors Ligne');
        }
      } else {
        setEstConnecte(false);
        setStatutLivreur('Hors Ligne'); // Si déconnecté, on force Hors Ligne
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- GESTIONNAIRES D'ÉTAT ---
  const handleLoginSuccess = () => setEstConnecte(true);
  const handleLogout = () => setEstConnecte(false);
  const handlePrendreCommande = (commande) => setCommandeActive(commande);
  const handleCommandeTerminee = () => setCommandeActive(null);

  // 4. NOUVEAU GESTIONNAIRE pour le statut
  const handleStatutChange = (newStatut) => {
    setStatutLivreur(newStatut);
  };

  // ... (le reste : if loadingAuth, return <BrowserRouter>...)
  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      {estConnecte && commandeActive ? (
        <LivraisonActive 
          commande={commandeActive} 
          onCommandeTerminee={handleCommandeTerminee} 
        />
      ) : (
        <Routes>
          {/* ... (Routes Publiques /login et /signup) ... */}
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="dashboard" 
              // 5. ON PASSE LE STATUT ET LE GESTIONNAIRE AU DASHBOARD
              element={
                <Dashboard 
                  onPrendreCommande={handlePrendreCommande}
                  statutLivreur={statutLivreur}
                  onStatutChange={handleStatutChange}
                />
              } 
            />
            <Route path="gains" element={<Gains />} />
            <Route 
              path="profil" 
              element={<Profil onLogout={handleLogout} />} 
            />
          </Route>

          {/* ... (Route *) ... */}
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