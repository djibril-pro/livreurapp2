import React, { useState } from 'react'; // Importer "useState"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ConnexionLivreur from './components/ConnexionLivreur.jsx';
import InscriptionLivreur from './components/InscriptionLivreur.jsx';

// Un composant simple pour votre tableau de bord (vous le remplacerez plus tard)
function Dashboard() {
  return <h2>Tableau de Bord du Livreur (Connecté !)</h2>;
}

function App() {
  // 1. On garde en mémoire si le livreur est connecté
  const [estConnecte, setEstConnecte] = useState(false);

  // 2. Cette fonction sera appelée par ConnexionLivreur.jsx
  const handleLoginSuccess = () => {
    setEstConnecte(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Page de Connexion */}
        <Route 
          path="/login" 
          element={
            !estConnecte ? 
            <ConnexionLivreur onLoginSuccess={handleLoginSuccess} /> : 
            <Navigate to="/dashboard" />
          } 
        />
        
        {/* Page d'Inscription */}
        <Route 
          path="/signup" 
          element={
            !estConnecte ? 
            <InscriptionLivreur /> : 
            <Navigate to="/dashboard" />
          } 
        />
        
        {/* Le Tableau de Bord (Route Protégée) */}
        <Route 
          path="/dashboard" 
          element={
            estConnecte ? 
            <Dashboard /> : 
            <Navigate to="/login" />
          } 
        />
        
        {/* Redirection par défaut */}
        <Route 
          path="*" 
          element={<Navigate to={estConnecte ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;