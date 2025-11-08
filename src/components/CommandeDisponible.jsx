import React from 'react';
import './CommandeDisponible.css'; // Importer le style

/**
 * Affiche une seule carte de commande disponible.
 * * Props attendues :
 * - commande: Un objet contenant les infos de la commande (ex: { id, nomRestaurant, gain })
 * - onAccepter: La fonction à appeler quand le bouton "Accepter" est cliqué
 */
function CommandeDisponible({ commande, onAccepter }) {

  // Sécurité : si on ne reçoit pas de commande, on n'affiche rien.
  if (!commande) {
    return null;
  }

  // Fonction "handler" locale qui appelle la fonction du parent
  const handleAccepterClick = () => {
    // On passe l'ID de la commande au parent
    onAccepter(commande.id); 
  };

  return (
    <div className="commande-card">
      
      {/* Infos de la commande (gauche) */}
      <div className="commande-info">
        <h3>{commande.nomRestaurant || 'Restaurant Inconnu'}</h3>
        <p>Adresse du restaurant...</p>
      </div>

      {/* Actions (droite) */}
      <div className="commande-action">
        <div className="commande-gain">
          {commande.gain ? `${commande.gain.toFixed(2)} €` : '...'}
        </div>
        <button onClick={handleAccepterClick}>
          Accepter
        </button>
      </div>

    </div>
  );
}

export default CommandeDisponible;