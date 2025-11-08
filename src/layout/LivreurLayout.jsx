import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './LivreurLayout.css';

function LivreurLayout() {
  return (
    <div className="livreur-layout">

      {/* Le contenu de la page (Dashboard, Profil, etc.) 
        sera injecté ici par React Router 
      */}
      <main className="layout-content">
        <Outlet />
      </main>

      {/* La barre de navigation en bas */}
      <nav className="bottom-nav">
        
        {/* On utilise NavLink au lieu de <a>.
          Il ajoute automatiquement la classe "active"
          quand on est sur le bon lien.
        */}
        <NavLink to="/dashboard" className="nav-link">
          {/* Vous pouvez ajouter des icônes SVG ici plus tard */}
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/profil" className="nav-link">
          <span>Profil</span>
        </NavLink>

      </nav>
    </div>
  );
}

export default LivreurLayout;