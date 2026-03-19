import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function CreateUser({onSuccess}) {
    const [users, setUsers] = useState({
        nom: "",
        prenom:"",
        email: "",
        password: "",
        role: "",
        telephone:"",
        specialiteRecherche:"",
        specialite:"",
        numeroOrdre:"",
        departement:""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setUsers({
            ...users,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () =>{
        if(!users.nom || !users.prenom || users.email || !users.password || !users.role || !users.departement || !users.telephone)
        {
            setError('Tous les champs sont obligatoires');
            return false;
        }

        if(users.role === 'MEDECIN')
        {
            if(!users.specialite || !users.numeroOrdre)
            {
                setError('La specialite et le numero d\'ordre sont obligatoires');
                return false;
            }
        }

        if(users.role = 'CHERCHEUR')
        {
            if(!users.specialiteRecherche)
            {
                setError('La specialite de recherche est requise');
                return false;
            }
        }

        if (users.role = 'ADMIN')
        {
            if(!users.departement)
            {
                setError('Le departement est requis');
                return false;
            }
        }

        const falidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!falidEmail.test(users.email))
        {
            setError('Email invalide');
            return false;
        }

        setError('');
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if(!validateForm()) return;

        try{
            let response;
            switch(users.role){
                case 'MEDECIN':
                    response = await createMedecin({
                        nom : users.nom,
                        prenom: users.prenom,
                        email: users.email,
                        password: users.password,
                        specialite: users.specialite,
                        numeroOrdre: users.numeroOrdre,
                        telephone: users.telephone
                    });
                    break;

                case 'CHERCHEUR':
                    response = await createChercheur({
                        nom: users.nom,
                        prenom: users.prenom,
                        email: users.email,
                        password: users.password,
                        specialiteRecherche: users.specialiteRecherche,
                        telephone: users.telephone
                    });
                    break;

                case 'ADMIN':
                    response = await createAdmin({
                        nom: users.nom,
                        prenom: users.prenom,
                        email: users.email,
                        password: users.password,
                        departement: users.departement,
                        telephone: users.telephone
                    });
                    break;

                default:
                    setError('Role invalide');
                    return;
            }

            setSuccess('Utilisateur cree avec succes');
            setUsers({
                    nom:'',
                    prenom:'',
                    password:'',
                    role:'',
                    telephone:'',
                    specialiteRecherche:'',
                    specialite:'',
                    numeroOrdre:'',
                    departement:''
                });

            if(onSuccess)
            {
                if(onSuccess)
                {
                    onSuccess();
                }
            }
            else
            {
                setError(response.message || 'Erreur lors de la creation de l\'utilisateur');
            }
        }
        catch(error)
        {
            console.error("Erreur lors de la creation de l'utilisateur: ", error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Erreur lors de la création de l\'utilisateur');
            }
            
            setError(error.message || 'Erreur lors de la creation de l\'utilisateur');
        }
    };

    //Reference pour le focus automatique
    const firstInputRef = useRef(null);

    //Focus sur le premier champ
    useEffect(() => {
        if(firstInputRef.current)
        {
            firstInputRef.current.focus();
        }
    }, []);

    //Mise a jour en cas de changement de role
    useEffect(() =>{
        if(firstInputRef.current){
            const parentModal = firstInputRef.current.closest('.modal-content');
            if(parentModal)
            {
                setTimeout(() => {
                    parentModal.scrollTop = 0;
                }, 50);
            }
        }
    }, [users.role]); // Se declanche quand le role change

    return(
        <div className="" ref={firstInputRef}>
            {error &&(
                <div className="">
                    {error}
                </div>
            )}

            {success &&(
                <div className="">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="">
                    <div className="">
                        <div className="">
                            Rôle:
                            <select
                                ref={firstInputRef}
                                name="role"
                                value={users.role}
                                onChange={handleChange}
                                className=""
                            >
                                <option value="">Selectionner un rôle</option>
                                <option value="MEDECIN">Médecin</option>
                                <option value="CHERCHEUR">Chercheur</option>
                                <option value="ADMIN">Administrateur</option>
                            </select>
                        </div>

                        <div className="">
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
                                    type={showPassword? "text" : 'password'}
                                    name='password'
                                    value={users.password}
                                    onChange={handleChange}
                                    className=""
                                    required
                                />
                            </div>
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className=""
                            >
                                {showPassword? 'Cacher' : 'Afficher'}
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
                                        type = "text"
                                        name="numeroOdre">
                                        value={users.numeroOrdre}
                                        onChange={handleChange}
                                        className=""
                                        required
                                   </input>
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
                            creer l'utilisateur
                        </button>
                        
                    </div>

                </div>
            </form>
        </div>
    )
};

export default CreateUser;