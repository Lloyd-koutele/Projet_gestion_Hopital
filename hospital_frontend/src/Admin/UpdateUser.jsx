import { useState, useEffect } from "react";
import { updateMedecin, updateChercheur, updateAdmin } from "../services/admin/adminServices";
import '../style/UpdateUser.css';

function UpdateUser({ userData, onSuccess }) {
    const [users, setUsers] = useState({
        nom: "",
        prenom: "",
        email: "",
        roles: "",
        telephone: "",
        specialiteRecherche: "",
        specialite: "",
        numeroOrdre: "",
        departement: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (userData) {
            const { password, ...rest } = userData;
            setUsers({ ...rest, password: "" });
        }
    }, [userData]);

    const handleChange = (e) => setUsers({ ...users, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (!users.nom || !users.prenom || !users.email || !users.roles || !users.telephone)
            return setError('Tous les champs sont obligatoires'), false;
        if (users.roles === 'MEDECIN' && (!users.specialite || !users.numeroOrdre))
            return setError("La spécialité et le numéro d'ordre sont obligatoires"), false;
        if (users.roles === 'CHERCHEUR' && !users.specialiteRecherche)
            return setError('La spécialité de recherche est requise'), false;
        if (users.roles === 'ADMIN' && !users.departement)
            return setError('Le département est requis'), false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(users.email))
            return setError('Email invalide'), false;
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const userId = users.id || userData.id;
            if (!userId) return setError("ID de l'utilisateur manquant");
            if (users.roles === 'MEDECIN') await updateMedecin(userId, users);
            else if (users.roles === 'CHERCHEUR') await updateChercheur(userId, users);
            else if (users.roles === 'ADMIN') await updateAdmin(userId, users);
            else return setError('Rôle invalide');
            setSuccess('Utilisateur mis à jour avec succès');
            setTimeout(() => onSuccess?.(), 4000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Erreur lors de la mise à jour");
        }
    };

    return (
        <div>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div>
                        <span className="role-badge">{users.roles}</span>
                    </div>

                    {/* NOM */}
                    <div className="form-field">
                        <input
                            type="text"
                            name="nom"
                            placeholder=" "
                            className="form-field-input"
                            value={users.nom} onChange={handleChange} required />

                        <label>Nom</label>
                    </div>

                    {/* PRÉNOM */}
                    <div className="form-field">
                        <input
                            type="text"
                            name="prenom"
                            placeholder=" "
                            className="form-field-input"

                            value={users.prenom} onChange={handleChange} required />
                        <label>Prénom</label>
                    </div>

                    {/* EMAIL */}
                    <div className="form-field">
                        <input
                            type="email"
                            name="email"
                            placeholder=" "
                            className="form-field-input"

                            value={users.email} onChange={handleChange} required />
                        <label>Email</label>
                    </div>

                    <div className="form-field">
                        <input
                            type="text"
                            name="telephone"
                            placeholder=" "
                            className="form-field-input"

                            value={users.telephone} onChange={handleChange} required />
                        <label>Téléphone</label>
                    </div>

                    <div className="form-field form-field-password">
                        <input
                            type={showPassword ? "text" : "password"} name="password" placeholder=" "
                            className="form-field-input" value={users.password} onChange={handleChange} />
                        <label>Nouveau mot de passe (optionnel)</label>
                        <button type="button" className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? 'masquer' : 'afficher'}
                        </button>
                    </div>

                    {users.roles === 'MEDECIN' && <>
                        <hr className="form-section-divider" />
                        <div className="form-field">
                            <input
                                type="text"
                                name="specialite"
                                placeholder=" "
                                className="form-field-input"
                                value={users.specialite} onChange={handleChange} required />
                            <label>Spécialité</label>
                        </div>
                        <div className="form-field">
                            <input type="text" name="numeroOrdre" placeholder=" " className="form-field-input"
                                value={users.numeroOrdre} onChange={handleChange} required />
                            <label>Numéro d'ordre</label>
                        </div>
                    </>}

                    {users.roles === 'CHERCHEUR' && <>
                        <hr className="form-section-divider" />
                        <div className="form-field">
                            <input
                                type="text"
                                name="specialiteRecherche"
                                placeholder=" "
                                className="form-field-input"

                                value={users.specialiteRecherche} onChange={handleChange} required />
                            <label>Spécialité de recherche</label>
                        </div>
                    </>}

                    {users.roles === 'ADMIN' && <>
                        <hr className="form-section-divider" />
                        <div className="form-field">
                            <input
                                type="text"
                                name="departement"
                                placeholder=" "
                                className="form-field-input"

                                value={users.departement} onChange={handleChange} required />
                            <label>Département</label>
                        </div>
                    </>}

                    <button type="submit" className="form-submit-btn">
                        Mettre à jour
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UpdateUser;