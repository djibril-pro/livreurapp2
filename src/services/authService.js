// Fichier: /src/services/authService.js

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebaseConfig"; // Importe depuis le fichier de config

/**
 * Crée un nouveau livreur (Authentification)
 * ET crée son profil dans la base de données (Firestore)
 */
export const creerLivreur = async (email, password, nom) => {
  try {
    // Étape 1: Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Étape 2: Créer le document du livreur dans la collection "Livreurs"
    // L'ID du document sera le même que l'ID d'authentification (user.uid)
    await setDoc(doc(db, "Livreurs", user.uid), {
      nom: nom,
      email: email,
      statut: "Hors Ligne", // Statut par défaut
      vehicule: "Non spécifié",
      livreurId: user.uid // Lier le profil à l'authentification
    });

    return user;
  } catch (error) {
    console.error("Erreur lors de la création du livreur:", error.message);
    throw error; // Renvoie l'erreur pour que l'interface puisse la gérer
  }
};

/**
 * Connecte un livreur existant
 */
export const connecterLivreur = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // L'utilisateur est connecté
    return userCredential.user;
  } catch (error) {
    console.error("Erreur de connexion:", error.message);
    throw error;
  }
};

/**
 * Déconnecte le livreur
 */
export const deconnecterLivreur = () => {
  return signOut(auth);
};