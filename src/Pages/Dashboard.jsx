import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig'; // Importer l'authentification
import { 
  ecouterCommandesDisponibles, 
  accepterCommande, 
  mettreAJourStatutLivreur 
} from '../services/commandeService'; // Assurez-vous que le chemin est bon
import CommandeDisponible from '../components/CommandeDisponible.jsx';
import './Dashboard.css'; // Importer le style
import notificationUrl from '/notification.mp3'; // Importer le son de notif

// MODIFICATION 1: Accepter { onPrendreCommande } en paramètre
function Dashboard({ onPrendreCommande }) {
  const [statutLivreur, setStatutLivreur] = useState('Hors Ligne');
  const [commandes, setCommandes] = useState([]);
  const audioPlayer = useRef(null); // Réf pour le lecteur audio
  
  // Gérer le changement de statut
  const handleToggleStatut = async () => {
    const livreurId = auth.currentUser?.uid;
    if (!livreurId) return; // Sécurité

    const newStatut = (statutLivreur === 'En Ligne') ? 'Hors Ligne' : 'En Ligne';
    
    try {
      await mettreAJourStatutLivreur(livreurId, newStatut);
      setStatutLivreur(newStatut);
    } catch (error) {
      console.error("Erreur de mise à jour du statut:", error);
    }
  };

  // Gérer l'acceptation d'une commande
  const handleAccepterCommande = async (commandeId) => {
    const livreurId = auth.currentUser?.uid;
    if (!livreurId) return;

    // MODIFICATION 2: Trouver l'objet commande complet
    const commandePrise = commandes.find(c => c.id === commandeId);

    const success = await accepterCommande(commandeId, livreurId);
    if (!success) {
      alert("Cette commande vient d'être prise par un autre livreur !");
    } else {
      // MODIFICATION 3: Appeler la fonction du parent (App.jsx)
      onPrendreCommande(commandePrise);
    }
    // L'écoute en temps réel s'occupera de retirer la commande
  };

  // Effet pour écouter les commandes quand on est "En Ligne"
  useEffect(() => {
    // Si on est Hors Ligne, on n'écoute rien et on vide la liste
    if (statutLivreur === 'Hors Ligne') {
      setCommandes([]);
      return;
    }

    // Si on est En Ligne, on s'abonne à l'écoute
    const unsubscribe = ecouterCommandesDisponibles((nouvellesCommandes) => {
      
      // Logique pour jouer le son de notification
      setCommandes(commandesActuelles => {
        if (nouvellesCommandes.length > commandesActuelles.length) {
          audioPlayer.current?.play(); // Jouer le son
        }
        return nouvellesCommandes; // Mettre à jour la liste
      });
    });

    // La fonction de "nettoyage" :
    // S'exécute quand on passe "Hors Ligne" ou quand le composant est détruit
    return () => {
      unsubscribe();
    };
    
  }, [statutLivreur]); // Cet effet se relance à chaque fois que "statutLivreur" change

  return (
    <div className="dashboard-container">
      {/* Le lecteur audio pour les notifications */}
      <audio ref={audioPlayer} src={notificationUrl} preload="auto"></audio>

      {/* Le bouton de statut */}
      <button 
        className={`status-toggle ${statutLivreur === 'En Ligne' ? 'en-ligne' : 'hors-ligne'}`}
        onClick={handleToggleStatut}
      >
        {statutLivreur === 'En Ligne' ? 'Vous êtes En Ligne' : 'Vous êtes Hors Ligne'}
      </button>

      {/* Titre de la section des commandes */}
      <h2 className="commande-header">Commandes disponibles</h2>

      {/* La liste des commandes */}
      <div className="commande-list">
        {statutLivreur === 'Hors Ligne' && (
          <p className="empty-state">Passez "En Ligne" pour recevoir des commandes.</p>
        )}

        {statutLivreur === 'En Ligne' && commandes.length === 0 && (
          <p className="empty-state">En attente de commandes...</p>
        )}

        {statutLivreur === 'En Ligne' && commandes.map(commande => (
          <CommandeDisponible 
            key={commande.id}
            commande={commande}
            onAccepter={handleAccepterCommande}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;