import React from 'react';
import { getCurrentUserInfo } from "../auth/authService";
import "../style/Header.css";

function Header() {
    const userInfo = getCurrentUserInfo();
    return (
        <header className="style-header">
            <h2 className="titre">
                Bienvenue sur MedConnect{" "}
                {userInfo?.role === "ADMIN" && `Admin ${userInfo.prenom} ${userInfo.nom}`}
                {userInfo?.role === "MEDECIN" && `Dr ${userInfo.prenom} ${userInfo.nom}`}
                {userInfo?.role === "CHERCHEUR" && `Chercheur ${userInfo.prenom} ${userInfo.nom}`}
                {userInfo?.role === "PATIENT" && `Patient ${userInfo.prenom} ${userInfo.nom}`}
            </h2>
        </header>
    );
}

export default Header;
