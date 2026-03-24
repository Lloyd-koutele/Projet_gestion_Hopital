import '../style/FilterUsers.css';

function FilterUsers({ filters, onChange }) {
    const handleChange = (e) => onChange({ ...filters, [e.target.name]: e.target.value });

    return (
        <div className="filter-bar">
            <input className="filter-input" name="nom" placeholder="Nom"
                value={filters.nom} onChange={handleChange} />
            <input className="filter-input" name="prenom" placeholder="Prénom"
                value={filters.prenom} onChange={handleChange} />
            <input className="filter-input" name="email" placeholder="Email"
                value={filters.email} onChange={handleChange} />
            <input className="filter-input" name="telephone" placeholder="Téléphone"
                value={filters.telephone} onChange={handleChange} />
            <select className="filter-input filter-select" name="roles"
                value={filters.roles} onChange={handleChange}>
                <option value="">Tous les rôles</option>
                <option value="MEDECIN">Médecin</option>
                <option value="CHERCHEUR">Chercheur</option>
                <option value="ADMIN">Administrateur</option>
            </select>
            <button className="filter-reset-btn"
                onClick={() => onChange({ nom: '', prenom: '', email: '', telephone: '', roles: '' })}>
                Réinitialiser
            </button>
        </div>
    );
}

export default FilterUsers;