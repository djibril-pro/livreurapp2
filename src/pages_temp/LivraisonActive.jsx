import React, { useState } from 'react';
import { mettreAJourStatutCommande } from '../services/commandeService';
import './LivraisonActive.css';

/**
 * * Props attendues :
 * - commande: L'objet de la commande active.
 * - onCommandeTerminee: Fonction à appeler quand la livraison est finie.
 */
function LivraisonActive({ commande, onCommandeTerminee }) {
  // L'état de l'étape : 'pickup' (chercher) ou 'dropoff' (livrer)
  const [etape, setEtape] = useState('pickup');

  // Sécurité : si pas de commande, ne rien afficher
  if (!commande) {
    return <p>Erreur : Aucune commande active.</p>;
  }

  // Ouvre l'adresse dans Google Maps (nouvel onglet)
  const handleOpenMaps = () => {
    const adresse = (etape === 'pickup') 
      ? commande.adresseRestaurant 
      : commande.adresseClient;
      
    // Encode l'adresse pour l'URL
    const url = `https://maps.google.com/?q=${encodeURIComponent(adresse)}`;
    window.open(url, '_blank');
  };

  // Gère le clic sur le bouton d'action principal
  const handleNextStep = async () => {
    if (etape === 'pickup') {
      // Le livreur vient de récupérer la commande
      try {
        await mettreAJourStatutCommande(commande.id, 'Récupérée');
        setEtape('dropoff'); // Passe à l'étape suivante
      } catch (error) {
        console.error("Erreur mise à jour statut 'Récupérée':", error);
      }
    } else {
      // Le livreur vient de livrer le client
      try {
        await mettreAJourStatutCommande(commande.id, 'Livrée');
        onCommandeTerminee(); // Informe le parent (App.jsx) que c'est fini
      } catch (error) {
        console.error("Erreur mise à jour statut 'Livrée':", error);
      }
    }
  };

  // Définir les variables en fonction de l'étape
  const estPickup = etape === 'pickup';
  const headerEtape = estPickup ? 'Étape 1 : Restaurant' : 'Étape 2 : Client';
  const nomLieu = estPickup ? commande.nomRestaurant : commande.nomClient;
  const adresseLieu = estPickup ? commande.adresseRestaurant : commande.adresseClient;
  const texteBouton = estPickup ? "J'ai récupéré la commande" : "Commande Livrée";

  return (
    <div className="livraison-active-container">
      <div className="address-card">
        <p className="step-header">{headerEtape}</p>
        <h2 className="address-title">{nomLieu || 'Nom non disponible'}</h2>
        <p className="address-details">{adresseLieu || 'Adresse non disponible'}</p>
      </div>

      <button className="map-button" onClick={handleOpenMaps}>
        Ouvrir dans Maps
      </button>

      <button 
        className={`action-button ${!estPickup ? 'etape-livraison' : ''}`}
        onClick={handleNextStep}
      >
        {texteBouton}
      </button>
    </div>
  );
}

export default LivraisonActive;