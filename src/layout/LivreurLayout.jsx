import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AiOutlineHome, AiOutlineUser, AiOutlineDollarCircle } from 'react-icons/ai'; // Import des icônes
import './LivreurLayout.css';

// Tableau des liens pour simplifier le rendu
const navLinks = [
  { to: "/dashboard", icon: AiOutlineHome, label: "Dashboard" },
  { to: "/gains", icon: AiOutlineDollarCircle, label: "Gain" }, // NOUVEAU LIEN
  { to: "/profil", icon: AiOutlineUser, label: "Profil" },
];

function LivreurLayout() {
  return (
    <div className="livreur-layout">

      <main className="layout-content">
        <Outlet />
      </main>

      {/* La barre de navigation en bas */}
      <nav className="bottom-nav">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {/* L'icône est à l'intérieur du cercle */}
            <div className="nav-icon-wrapper">
              <Icon className="nav-icon" />
              {/* Le texte disparaît quand l'onglet est actif */}
              <span className="nav-label">{label}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default LivreurLayout;