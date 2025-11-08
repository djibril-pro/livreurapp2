import React, { useEffect, useRef } from 'react'; // 1. On enlève useState
import { auth } from '../firebaseConfig';
import { 
  ecouterCommandesDisponibles, 
  accepterCommande, 
  mettreAJourStatutLivreur 
} from '../services/CommandeService.js';
import CommandeDisponible from '../components/CommandeDisponible.jsx';
import './Dashboard.css';
import notificationUrl from '/notification.mp3';

// 2. ON REÇOIT LES NOUVELLES PROPS
function Dashboard({ onPrendreCommande, statutLivreur, onStatutChange }) {
  
  // 3. ON SUPPRIME le useState local pour le statut
  // const [statutLivreur, setStatutLivreur] = useState('Hors Ligne'); 
  const [commandes, setCommandes] = useState([]);
  const audioPlayer = useRef(null);
  
  // 4. MODIFICATION de la fonction
  const handleToggleStatut = async () => {
    const livreurId = auth.currentUser?.uid;
    if (!livreurId) return;

    // On lit la prop "statutLivreur"
    const newStatut = (statutLivreur === 'En Ligne') ? 'Hors Ligne' : 'En Ligne';
    
    try {
      await mettreAJourStatutLivreur(livreurId, newStatut);
      // On appelle la fonction du parent (App.jsx)
      onStatutChange(newStatut); 
    } catch (error) {
      console.error("Erreur de mise à jour du statut:", error);
    }
  };

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

  // 5. L'EFFET d'écoute ne change pas, mais il dépend
  //    maintenant de la PROP "statutLivreur"
  useEffect(() => {
    if (statutLivreur === 'Hors Ligne') {
      setCommandes([]);
      return;
    }

    const unsubscribe = ecouterCommandesDisponibles((nouvellesCommandes) => {
      setCommandes(commandesActuelles => {
        if (nouvellesCommandes.length > commandesActuelles.length && commandesActuelles.length > 0) {
          audioPlayer.current?.play();
        }
        return nouvellesCommandes;
      });
    });

    return () => unsubscribe();
    
  }, [statutLivreur]); // Dépend de la prop

  // Le return (affichage) reste identique,
  // il lit simplement la prop "statutLivreur"
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