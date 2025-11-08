// On importe la base de données de NOTRE Projet B (Livreur)
import { db } from '../firebaseConfig'; 
import { 
  ref, 
  onValue, 
  query, 
  orderByChild, 
  equalTo,
  runTransaction,
  set 
} from "firebase/database";

const DB_COLLECTION = 'Commandes_Livraison';

/**
 * Écoute en temps réel les commandes qui n'ont pas de livreur 
 * et dont le statut est "En attente".
 * * @param {function} callback - La fonction à appeler à chaque mise à jour 
 * (elle recevra la liste des commandes).
 * @returns {function} - Une fonction pour se désabonner de l'écoute.
 */
export const ecouterCommandesDisponibles = (callback) => {
  // On crée une requête pour filtrer les commandes :
  // On veut celles qui ont le statut "En attente de livreur"
  const commandesRef = query(
    ref(db, DB_COLLECTION), 
    orderByChild('statut'), 
    equalTo('En attente de livreur')
  );

  // onValue() s'exécute 1 fois, puis à chaque changement
  const unsubscribe = onValue(commandesRef, (snapshot) => {
    const commandesDisponibles = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        commandesDisponibles.push({
          id: childSnapshot.key, // L'ID unique de la commande
          ...childSnapshot.val() // Le reste des données (nomRestaurant, gain, etc.)
        });
      });
    }
    // On envoie la liste (même vide) à notre composant Dashboard
    callback(commandesDisponibles);
  });

  // On retourne la fonction qui permet d'arrêter l'écoute
  return unsubscribe;
};

/**
 * Tente d'accepter une commande pour un livreur.
 * Utilise une transaction pour garantir qu'un seul livreur la prend.
 * * @param {string} commandeId - L'ID de la commande à prendre.
 * @param {string} livreurId - L'ID du livreur qui tente de la prendre.
 * @returns {Promise<boolean>} - True si la transaction réussit, false sinon.
 */
export const accepterCommande = async (commandeId, livreurId) => {
  const commandeRef = ref(db, `${DB_COLLECTION}/${commandeId}`);

  try {
    const { committed, snapshot } = await runTransaction(commandeRef, (commandeActuelle) => {
      // Si la commande a été supprimée ou déjà prise PENDANT la transaction
      if (commandeActuelle === null || commandeActuelle.statut !== 'En attente de livreur') {
        // On annule la transaction
        return; 
      }

      // C'est bon, on la prend !
      commandeActuelle.statut = 'En cours de livraison';
      commandeActuelle.livreurId = livreurId;
      
      return commandeActuelle; // On valide la modification
    });

    if (committed) {
      console.log('Commande prise avec succès !');
      return true;
    } else {
      console.log('La commande a été prise par un autre livreur.');
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la transaction :", error);
    return false;
  }
};

/**
 * Met à jour le statut du livreur (En Ligne / Hors Ligne)
 * dans la base de données "Livreurs".
 * * @param {string} livreurId - L'ID du livreur (vient de l'authentification).
 * @param {string} statut - "En Ligne" ou "Hors Ligne".
 */
export const mettreAJourStatutLivreur = (livreurId, statut) => {
  const livreurRef = ref(db, `Livreurs/${livreurId}/statut`);
  return set(livreurRef, statut);
};

// --- Fonctions pour la livraison active (Étape 5) ---

/**
 * Met à jour le statut d'une commande (ex: "Récupérée", "Livrée").
 */
export const mettreAJourStatutCommande = (commandeId, statut) => {
  const statutRef = ref(db, `${DB_COLLECTION}/${commandeId}/statut`);
  return set(statutRef, statut);
};