import React from 'react';

function Header() {
    const role = getCurrentUserRole();
    return (
        <header>
            <h2> Bienvenue sur le site

                if (role == "ADMIN"){
                    "L'admin"
                }
                else if (role == "MEDECIN"){
                    "Le medecin"
                }
                else if (role == "CHERCHEUR"){
                    "Le Chercheur"
                }
                else if (role == "PATIENT"){
                    "Le Patient"
                }
            </h2>

            <button onClick={() => { window.location.href = '/login'; }}>
                Se deconnecter
            </button>
        </header>
    );
}

export default Header;
