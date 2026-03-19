import React from 'react';
import { getCurrentUserInfo } from '../services/authService';
function Header() {
    const role = getCurrentUserInfo.role;
    return (
        <header>
            <h2> Bienvenue sur le site

                if (role == "ADMIN"){
                    "admin " + getCurrentUserInfo.prenom + " " + getCurrentUserInfo.nom
                }
                else if (role == "MEDECIN"){
                    "Dr " + getCurrentUserInfo.prenom + " " + getCurrentUserInfo.nom
                }
                else if (role == "CHERCHEUR"){
                    "chercheur "  + getCurrentUserInfo.prenom + " " + getCurrentUserInfo.nom
                }
                else if (role == "PATIENT"){
                    "patient "+ getCurrentUserInfo.prenom + " " + getCurrentUserInfo.nom
                }
            </h2>
        </header>
    );
}

export default Header;
