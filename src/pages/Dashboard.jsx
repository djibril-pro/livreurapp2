import React, { useState, useEffect, useRef } from 'react'; // <-- LE VOILÀ !
import { auth } from '../firebaseConfig';
import { 
  ecouterCommandesDisponibles, 
  accepterCommande, 
  mettreAJourStatutLivreur 
} from '../services/CommandeService.js';
import CommandeDisponible from '../components/CommandeDisponible.jsx';
import './Dashboard.css';
import notificationUrl from '/notification.mp3';

// Le Dashboard reçoit son statut du parent (App.jsx)
function Dashboard({ onPrendreCommande, statutLivreur, onStatutChange }) {
  
  // Cet état local (pour les commandes) est toujours nécessaire
  const [commandes, setCommandes] = useState([]);
  const audioPlayer = useRef(null);
  
  // Gère le clic sur le bouton
  const handleToggleStatut = async () => {
    const livreurId = auth.currentUser?.uid;
    if (!livreurId) return;

    const newStatut = (statutLivreur === 'En Ligne') ? 'Hors Ligne' : 'En Ligne';
    
    try {
      await mettreAJourStatutLivreur(livreurId, newStatut);
      // Informe le parent (App.jsx) du changement
      onStatutChange(newStatut); 
    } catch (error) {
      console.error("Erreur de mise à jour du statut:", error);
    }
  };

  // Gère l'acceptation
  const handleAccepterCommande = async (commandeId) => {
    const livreurId = auth.currentUser?.uid;
    if (!livreurId) return;
    const commandePrise = commandes.find(c => c.id === commandeId);

    const success = await accepterCommande(commandeId, livreurId);
    if (success) {
      onPrendreCommande(commandePrise);
    } else {
      alert("Cette commande vient d'être prise par un autre livreur !");
    }
  };

  // Effet d'écoute (qui dépend de la prop 'statutLivreur')
  useEffect(() => {
    if (statutLivreur === 'Hors Ligne') {
      setCommandes([]);
      return;
    }

    const unsubscribe = ecouterCommandesDisponibles((nouvellesCommandes) => {
      setCommandes(commandesActuelles => {
        // Joue le son seulement si une nouvelle commande arrive
        if (nouvellesCommandes.length > commandesActuelles.length && commandesActuelles.length > 0) {
          audioPlayer.current?.play();
        }
        return nouvellesCommandes;
      });
    });

    return () => unsubscribe();
    
  }, [statutLivreur]); // Dépend de la prop qui vient de App.jsx

  // L'affichage reste le même
  return (
    <div className="dashboard-container">
      <audio ref={audioPlayer} src={notificationUrl} preload="auto"></audio>

      <button 
        className={`status-toggle ${statutLivreur === 'En Ligne' ? 'en-ligne' : 'hors-ligne'}`}
        onClick={handleToggleStatut}
      >
        {statutLivreur === 'En Ligne' ? 'Vous êtes En Ligne' : 'Vous êtes Hors Ligne'}
      </button>

      <h2 className="commande-header">Commandes disponibles</h2>
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