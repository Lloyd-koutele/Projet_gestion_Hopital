import { useState, useEffect, useRef } from "react";
import { createMedecin, createChercheur, createAdmin } from "../services/admin/adminServices";
import '../style/CreateUser.css';

function CreateUser({ onSuccess }) {
    const [users, setUsers] = useState({
        nom: "", prenom: "", email: "", password: "",
        role: "", telephone: "", specialiteRecherche: "",
        specialite: "", numeroOrdre: "", departement: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const firstInputRef = useRef(null);

    useEffect(() => { firstInputRef.current?.focus(); }, []);

    const handleChange = (e) => setUsers({ ...users, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (!users.nom || !users.prenom || !users.email || !users.password || !users.role || !users.telephone)
            return setError('Tous les champs sont obligatoires'), false;
        if (users.role === 'MEDECIN' && (!users.specialite || !users.numeroOrdre))
            return setError("La spécialité et le numéro d'ordre sont obligatoires"), false;
        if (users.role === 'CHERCHEUR' && !users.specialiteRecherche)
            return setError('La spécialité de recherche est requise'), false;
        if (users.role === 'ADMIN' && !users.departement)
            return setError('Le département est requis'), false;
        if (!/^\S+@\S+\.\S+$/.test(users.email))
            return setError('Email invalide'), false;
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!validateForm()) return;
        try {
            const base = { nom: users.nom, prenom: users.prenom, email: users.email, password: users.password, telephone: users.telephone };
            if (users.role === 'MEDECIN') await createMedecin({ ...base, specialite: users.specialite, numeroOrdre: users.numeroOrdre });
            else if (users.role === 'CHERCHEUR') await createChercheur({ ...base, specialiteRecherche: users.specialiteRecherche });
            else if (users.role === 'ADMIN') await createAdmin({ ...base, departement: users.departement });
            else return setError('Rôle invalide');
            setSuccess('Utilisateur créé avec succès');
            setUsers({ nom: '', prenom: '', password: '', email: '', role: '', telephone: '', specialiteRecherche: '', specialite: '', numeroOrdre: '', departement: '' });
            setTimeout(() => onSuccess?.(), 4000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Erreur lors de la création");
        }
    };

    return (
        <div>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">

                    {/* RÔLE */}
                    <div className="form-field">
                        <select
                            ref={firstInputRef}
                            name="role"
                            className={`form-field-input${users.role ? ' has-value' : ''}`}
                            value={users.role}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden></option>
                            <option value="MEDECIN">Médecin</option>
                            <option value="CHERCHEUR">Chercheur</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                        <label>Rôle</label>
                    </div>

                    {/* NOM */}
                    <div className="form-field">
                        <input type="text" name="nom" placeholder=" " className="form-field-input"
                            value={users.nom} onChange={handleChange} required />
                        <label>Nom</label>
                    </div>

                    {/* PRÉNOM */}
                    <div className="form-field">
                        <input type="text" name="prenom" placeholder=" " className="form-field-input"
                            value={users.prenom} onChange={handleChange} required />
                        <label>Prénom</label>
                    </div>

                    {/* EMAIL */}
                    <div className="form-field">
                        <input type="email" name="email" placeholder=" " className="form-field-input"
                            value={users.email} onChange={handleChange} required />
                        <label>Email</label>
                    </div>

                    {/* TÉLÉPHONE */}
                    <div className="form-field">
                        <input type="text" name="telephone" placeholder=" " className="form-field-input"
                            value={users.telephone} onChange={handleChange} required />
                        <label>Téléphone</label>
                    </div>

                    {/* MOT DE PASSE */}
                    <div className="form-field form-field-password">
                        <input type={showPassword ? "text" : "password"} name="password" placeholder=" "
                            className="form-field-input" value={users.password} onChange={handleChange} required />
                        <label>Mot de passe</label>
                        <button type="button" className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? 'masquer' : 'afficher'}
                        </button>
                    </div>

                    {/* CHAMPS CONDITIONNELS */}
                    {users.role === 'MEDECIN' && <>
                        <hr className="form-section-divider" />
                        <div className="form-field">
                            <input type="text" name="specialite" placeholder=" " className="form-field-input"
                                value={users.specialite} onChange={handleChange} required />
                            <label>Spécialité</label>
                        </div>
                        <div className="form-field">
                            <input type="text" name="numeroOrdre" placeholder=" " className="form-field-input"
                                value={users.numeroOrdre} onChange={handleChange} required />
                            <label>Numéro d'ordre</label>
                        </div>
                    </>}

                    {users.role === 'CHERCHEUR' && <>
                        <hr className="form-section-divider" />
                        <div className="form-field">
                            <input type="text" name="specialiteRecherche" placeholder=" " className="form-field-input"
                                value={users.specialiteRecherche} onChange={handleChange} required />
                            <label>Spécialité de recherche</label>
                        </div>
                    </>}

                    {users.role === 'ADMIN' && <>
                        <hr className="form-section-divider" />
                        <div className="form-field">
                            <input type="text" name="departement" placeholder=" " className="form-field-input"
                                value={users.departement} onChange={handleChange} required />
                            <label>Département</label>
                        </div>
                    </>}

                    <button type="submit" className="form-submit-btn">
                        Créer l'utilisateur
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateUser;