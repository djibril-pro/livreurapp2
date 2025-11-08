// On importe les fonctions de FIRESTORE
import { db } from '../firebaseConfig'; 
import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  runTransaction, 
  updateDoc 
} from "firebase/firestore";

const DB_COLLECTION = 'Commandes_Livraison';

/**
 * Écoute en temps réel les commandes qui ont le statut "En attente".
 */
export const ecouterCommandesDisponibles = (callback) => {
  // On crée une requête Firestore
  const q = query(
    collection(db, DB_COLLECTION), 
    where('statut', '==', 'En attente de livreur')
  );

  // onSnapshot est l'équivalent de onValue (Firestore)
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const commandesDisponibles = [];
    querySnapshot.forEach((doc) => {
      commandesDisponibles.push({
        id: doc.id, // L'ID unique du document
        ...doc.data() // Le reste des données
      });
    });
    callback(commandesDisponibles);
  });

  return unsubscribe; // Fonction pour arrêter l'écoute
};

/**
 * Tente d'accepter une commande pour un livreur (Transaction Firestore).
 */
export const accepterCommande = async (commandeId, livreurId) => {
  const commandeRef = doc(db, DB_COLLECTION, commandeId); // Référence de document

  try {
    // La transaction est un peu différente sur Firestore
    await runTransaction(db, async (transaction) => {
      const commandeDoc = await transaction.get(commandeRef);
      
      if (!commandeDoc.exists()) {
        throw "La commande n'existe plus.";
      }
      
      const commandeData = commandeDoc.data();
      
      if (commandeData.statut !== 'En attente de livreur') {
        // Annule la transaction si déjà prise
        return false; 
      }
      
      // C'est bon, on la prend !
      transaction.update(commandeRef, { 
        statut: 'En cours de livraison',
        livreurId: livreurId 
      });
    });

    console.log('Commande prise avec succès !');
    return true;
    
  } catch (error) {
    console.error("Échec de la transaction :", error);
    if (error === false) return false; // "false" signifie "déjà prise"
    return false;
  }
};

/**
 * Met à jour le statut du livreur (En Ligne / Hors Ligne)
 */
export const mettreAJourStatutLivreur = (livreurId, statut) => {
  const livreurRef = doc(db, 'Livreurs', livreurId); // Cible le document du livreur
  // updateDoc met à jour le champ "statut" sans écraser le reste
  return updateDoc(livreurRef, { 
    statut: statut 
  });
};

/**
 * Met à jour le statut d'une commande (ex: "Récupérée", "Livrée").
 */
export const mettreAJourStatutCommande = (commandeId, statut) => {
  const commandeRef = doc(db, DB_COLLECTION, commandeId);
  return updateDoc(commandeRef, { 
    statut: statut 
  });
};
export const ecouterGainsLivreur = (livreurId, callback) => {
  if (!livreurId) {
    callback(0);
    return () => {};
  }
  
  // Requête : Commandes de ce livreur ET statut 'Livrée'
  const q = query(
    collection(db, DB_COLLECTION), 
    where('livreurId', '==', livreurId),
    where('statut', '==', 'Livrée')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    let totalGains = 0;
    querySnapshot.forEach((doc) => {
      const gain = doc.data().gain || 0; // Utiliser le champ 'gain'
      // S'assurer que 'gain' est un nombre (important si c'est stocké comme string)
      totalGains += parseFloat(gain); 
    });
    
    // On retourne le total formaté à deux décimales
    callback(totalGains.toFixed(2));
  });

  return unsubscribe;
};