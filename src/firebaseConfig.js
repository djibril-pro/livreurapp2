// Fichier: /src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // J'utilise Firestore, c'est le successeur de Realtime Database

// TODO: Remplacez ceci par la configuration de VOTRE projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDPDO8fZuWZcUGg8MRKYSZp7SPVSt5PiAU",
  authDomain: "livreurtest1.firebaseapp.com",
  projectId: "livreurtest1",
  storageBucket: "livreurtest1.firebasestorage.app",
  messagingSenderId: "590137645609",
  appId: "1:590137645609:web:f5ada7d96e1c675fb21a38"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services dont vous aurez besoin
export const auth = getAuth(app);
export const db = getFirestore(app); // C'est la base de données pour les profils livreurs