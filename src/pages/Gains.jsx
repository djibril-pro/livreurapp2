import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { ecouterGainsLivreur } from '../services/CommandeService';
import './Gains.css'; // Nous allons créer ce fichier

function Gains() {
  const [gainsTotal, setGainsTotal] = useState('0.00');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const livreurId = auth.currentUser?.uid;
    
    if (livreurId) {
      // Démarrer l'écoute des gains
      const unsubscribe = ecouterGainsLivreur(livreurId, (total) => {
        setGainsTotal(total);
        setLoading(false);
      });

      return () => unsubscribe(); // Arrêter l'écoute au nettoyage
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="gains-container">
      <h2 className="gains-header">Mes Gains</h2>
      
      <div className="gains-card">
        <p className="gains-label">Total cumulé</p>
        {loading ? (
            <div className="gains-amount loading">Chargement...</div>
        ) : (
            <div className="gains-amount">{gainsTotal} €</div>
        )}
        <p className="gains-period">Depuis le début</p>
      </div>

      <p className="gains-note">Seules les commandes au statut 'Livrée' sont incluses.</p>
    </div>
  );
}

export default Gains;