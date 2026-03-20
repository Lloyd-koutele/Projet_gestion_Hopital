import { useState, useEffect } from "react";
import { updateMedecin, updateChercheur, updateAdmin } from "../services/admin/adminServices";

function UpdateUser({ userData, onSuccess }) {
    const [users, setUsers] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        role: "",
        telephone: "",
        specialiteRecherche: "",
        specialite: "",
        numeroOrdre: "",
        departement: ""
    });

    useEffect(() => {
        if (userData) {
            setUsers({
                ...userData,
                password: ""
            });
        }
    }, [userData]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setUsers({
            ...users,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!users.nom || !users.prenom || !users.email || !users.role || !users.telephone) {
            setError('Tous les champs sont obligatoires');
            return false;
        }

        if (users.role === 'MEDECIN') {
            if (!users.specialite || !users.numeroOrdre) {
                setError('La specialite et le numero d\'ordre sont obligatoires');
                return false;
            }
        }

        if (users.role === 'CHERCHEUR') {
            if (!users.specialiteRecherche) {
                setError('La specialite de recherche est requise');
                return false;
            }
        }

        if (users.role === 'ADMIN') {
            if (!users.departement) {
                setError('Le departement est requis');
                return false;
            }
        }

        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validEmail.test(users.email)) {
            setError('Email invalide');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const userId = users.id || userData.id;

            if (!userId) {
                setError("ID de l'utilisateur manquant");
                return;
            }

            let response;
            switch (users.role) {
                case 'MEDECIN':
                    response = await updateMedecin(userId, users);
                    break;
                case 'CHERCHEUR':
                    response = await updateChercheur(userId, users);
                    break;
                case 'ADMIN':
                    response = await updateAdmin(userId, users);
                    break;
                default:
                    setError('Rôle invalide');
                    return;
            }


            setSuccess('Utilisateur mis a jour avec succes');
            setUsers({
                nom: '',
                prenom: '',
                email: '',
                password: '',
                role: '',
                telephone: '',
                specialiteRecherche: '',
                specialite: '',
                numeroOrdre: '',
                departement: ''
            });

            if (response) {
                setSuccess('Utilisateur mis a jour avec succes');
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                setError(response.message || "Erreur lors de la mise a jour de l'utilisateur");
            }
        }
        catch (error) {
            console.error("Erreur lors de la mise a jour de l'utilisateur: ", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Erreur lors de la mise a jour de l\'utilisateur');
            }

            setError(error.message || 'Erreur lors de la mise a jourde l\'utilisateur');
        }
    };

    return (
        <div className="">
            {error && (
                <div className="">
                    {error}
                </div>
            )}

            {success && (
                <div className="">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="">
                    <div className="">
                        <div className="">

                            <div className="">
                                Role : <strong>{users.role}</strong>
                            </div>

                            <div className="">
                                Nom:
                                <input
                                    type='text'
                                    name='nom'
                                    value={users.nom}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </div>
                        </div>

                        <div className="">
                            <div className="">
                                Prenom:
                                <input
                                    type='text'
                                    name='prenom'
                                    value={users.prenom}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </div>
                        </div>

                        <div className="">
                            <div className="">
                                Email:
                                <input
                                    type='email'
                                    name='email'
                                    value={users.email}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </div>
                        </div>

                        <div className="">
                            <div className="">
                                Telephone:
                                <input
                                    type='text'
                                    name='telephone'
                                    value={users.telephone}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </div>
                        </div>

                        <div className="">
                            <div className="">
                                Mot de passe:
                                <input
                                    type={showPassword ? "text" : 'password'}
                                    name='password'
                                    value={users.password}
                                    onChange={handleChange}
                                    className=""
                                />
                            </div>
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className=""
                            >
                                {showPassword ? 'Cacher' : 'Afficher'}
                            </button>
                        </div>
                    </div>

                    {users.role === 'MEDECIN' && (
                        <div className="">
                            <label className="">
                                Spécialité:
                                <input
                                    type='text'
                                    name='specialite'
                                    value={users.specialite}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </label>

                            <label className="">
                                Numero d'ordre:
                                <input
                                    type="text"
                                    name="numeroOrdre"
                                    value={users.numeroOrdre}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </label>
                        </div>
                    )}

                    {users.role === 'CHERCHEUR' && (
                        <div className="">
                            <label className="">
                                Specialite Recherche:
                                <input
                                    type='text'
                                    name='specialiteRecherche'
                                    value={users.specialiteRecherche}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </label>
                        </div>
                    )}

                    {users.role === 'ADMIN' && (
                        <div className="">
                            <label className="">
                                Departement:
                                <input
                                    type='text'
                                    name='departement'
                                    value={users.departement}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </label>
                        </div>
                    )}

                    <div className="">
                        <button
                            type='submit'
                            className=""
                        >
                            Mettre a jour l'utilisateur
                        </button>

                    </div>

                </div>
            </form>
        </div>
    )
};

export default UpdateUser;