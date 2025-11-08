import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Importer Link pour la navigation
import { connecterLivreur } from '../services/authService';
import './ConnexionLivreur.css'; // 2. Importer votre nouveau CSS

// 3. Accepter la fonction "onLoginSuccess" en paramètre
function ConnexionLivreur({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      await connecterLivreur(email, password);
      // 4. Au lieu d'une alerte, appeler la fonction du parent !
      onLoginSuccess();
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    // 5. Utiliser les classes CSS que nous venons de créer
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Connexion Livreur</h2>
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
            placeholder="Mot de passe" 
            required 
          />
        </div>
        <button type="submit">Se connecter</button>
        {error && <p className="error-message">{error}</p>}
        
        {/* 6. Ajouter le lien vers la page d'inscription */}
        <p className="signup-link">
          Pas encore de compte ? <Link to="/signup">Inscrivez-vous</Link>
        </p>
      </form>
    </div>
  );
}

export default ConnexionLivreur;