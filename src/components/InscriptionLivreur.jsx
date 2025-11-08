import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Importer Link pour la navigation
import { creerLivreur } from '../services/authService';
import './ConnexionLivreur.css'; // 2. RÉUTILISER le même CSS !

function InscriptionLivreur() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    try {
      await creerLivreur(email, password, nom);
      setSuccess(true);
      setError(null); // S'assurer que les anciennes erreurs sont parties
    } catch (err) {
      setError("Erreur : " + err.message);
    }
  };

  return (
    // 3. Utiliser les classes CSS du fichier de connexion
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Créer un compte Livreur</h2>

        {/* 4. Gérer le message de succès */}
        {success ? (
          <div>
            <p style={{ color: 'green' }}>Compte créé avec succès !</p>
            <p className="signup-link">
              <Link to="/login">Cliquez ici pour vous connecter</Link>
            </p>
          </div>
        ) : (
          // 5. Utiliser React.Fragment pour regrouper les éléments sans div
          <React.Fragment>
            <div className="input-group">
              <input 
                type="text" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                placeholder="Nom complet" 
                required 
              />
            </div>
            <div className="input-group">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email" 
                required 
              />
            </div>
            <div className="input-group">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mot de passe (6+ caractères)" 
                required 
              />
            </div>
            <button type="submit">S'inscrire</button>

            {error && <p className="error-message">{error}</p>}
            
            {/* 6. Ajouter le lien pour retourner à la connexion */}
            <p className="signup-link">
              Déjà un compte ? <Link to="/login">Connectez-vous</Link>
            </p>
          </React.Fragment>
        )}
      </form>
    </div>
  );
}

export default InscriptionLivreur;