import React from 'react';
import { auth } from '../firebaseConfig.js'; // Pour lire les infos de l'utilisateur
import { deconnecterLivreur } from '../services/authService.js'; // Notre service d'authentification
import './Profil.css';

/**
 * * Props attendues :
 * - onLogout: Une fonction (qui viendra de App.jsx) 
 * pour dire à l'application que l'utilisateur s'est déconnecté.
 */
function Profil({ onLogout }) {
  // On récupère l'utilisateur actuel depuis Firebase Auth
  const user = auth.currentUser;
  const userEmail = user ? user.email : 'Email non trouvé';

  // Gère le clic sur le bouton de déconnexion
  const handleLogout = async () => {
    try {
      await deconnecterLivreur(); // Appelle la fonction de Firebase
      onLogout(); // Appelle la fonction du parent (App.jsx)
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="profil-container">
      <h2 className="profil-header">Mon Profil</h2>

      <div className="profil-info">
        <p>Connecté en tant que :</p>
        <p className="email">{userEmail}</p>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Se Déconnecter
      </button>
    </div>
  );
}

export default Profil;