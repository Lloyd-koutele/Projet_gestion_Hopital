import React, { useState, useEffect } from 'react';
import CreateUser from "./CreateUser";
import Sidebar from "../Page/Sidebar";
import UserTable from "./UserTable";
import UpdateUser from "./UpdateUser";
import Modal from "../Page/Modal";
import { getAllUsers, updateUserStatus, deleteUser } from "../services/admin/adminServices";
import "../style/AdminDashboard.css";
import { getCurrentUserInfo } from "../auth/authService";
import Header from "../Page/Header";
import Confirme from "../Page/Confirme";
import Footer from "../Page/Footer";
import FilterUsers from "../hooks/FilterUsers";
import Pagination from "../hooks/Pagination";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const userInfo = getCurrentUserInfo();
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        nom: '', prenom: '', email: '', telephone: '', roles: ''
    });
    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError("");
                setSuccess("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Erreur lors de la recuperation des utilisateurs: ", error);
            setError("Erreur lors de la recuperation des utilisateurs");
        }
    };

    const [open, setOpen] = useState(true);

    const [confirme, setConfirme] = useState({ isOpen: false, userId: null });

    const handleConfirmDelete = async () => {
    const { userId } = confirme;
    setConfirme({ isOpen: false, userId: null });
    setActionInProgress(true);
    try {
        await deleteUser(userId);
        setSuccess("Utilisateur supprimé avec succès");
        await fetchUsers();
    } catch (error) {
        setError(error.message || "Erreur lors de la suppression");
    } finally {
        setActionInProgress(false);
    }
};

    const handleAction = async (userId, action) => {
        setActionInProgress(true);
        setError("");
        setSuccess("");
        try {
            if (action === "block-unblock") {
                const user = users.find((u) => u.id === userId);
                if (user) {
                    const isActif = user.actif === true || user.actif === "true";
                    const newStatus = !isActif;
                    await updateUserStatus(userId, newStatus);
                    setSuccess("Statut de l'utilisateur mis à jour avec succès");
                    await fetchUsers();
                }
            } else if (action === "edit") {
                const user = users.find((u) => u.id === userId);
                if (user) {
                    setSelectedUser(user);
                    setIsUpdateModalOpen(true);
                }
            }else if (action === "delete") {
                setConfirme({ isOpen: true, userId });
                return;
            }
        } catch (error) {
            console.error("Erreur lors de l'action: ", error);
            setError("Erreur lors de l'action");
        } finally {
            setActionInProgress(false);
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
    };

    const handleUserUpdated = (message) => {
        fetchUsers();
        handleCloseModal();
        setSuccess(message);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Reset page 1 quand le filtre change
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    // Filtrage
    const filteredUsers = users.filter(u =>
        u.nom?.toLowerCase().includes(filters.nom.toLowerCase()) &&
        u.prenom?.toLowerCase().includes(filters.prenom.toLowerCase()) &&
        u.email?.toLowerCase().includes(filters.email.toLowerCase()) &&
        u.telephone?.toLowerCase().includes(filters.telephone.toLowerCase()) &&
        (filters.roles === '' || u.roles === filters.roles)
    );

    // Pagination appliquée sur le résultat filtré
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    

    return (
        <div className="admin-dashboard">
            <Header />

            <div className="admin-body">
                <Sidebar>
                    <nav className="sidebar-nav">
                        <div>
                            <div className="main-header">
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="sidebar-btn"
                                >
                                    Créer un utilisateur
                                </button>
                            </div>

                            <div className="main-header">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="sidebar-btn"
                                >
                                    {isOpen ? "Masquer la liste des utilisateurs" : "Liste des utilisateurs"}
                                </button>
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                        </div>
                    </nav>
                </Sidebar>

                <Confirme
                    isOpen={confirme.isOpen}
                    message="Confirmer la suppression de cet utilisateur ?"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirme({ isOpen: false, userId: null })}
                />

                <div className='main-content'>
                    {isOpen && (
                        <>
                            <FilterUsers filters={filters} onChange={handleFilterChange} />

                            {/* compteur */}
                            <p className="users-count">
                                <span>{filteredUsers.length}</span> utilisateur{filteredUsers.length > 1 ? 's' : ''}
                                {filteredUsers.length !== users.length && <> sur <span>{users.length}</span></>}
                            </p>

                            <UserTable
                                users={paginatedUsers}
                                onAction={handleAction}
                                actionInProgress={actionInProgress}
                            />

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>

                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseModal}
                    title="Créer un utilisateur"
                >
                    <CreateUser
                        onSuccess={handleUserUpdated}
                        onClose={handleCloseModal}
                    />
                </Modal>

                <Modal
                    isOpen={isUpdateModalOpen}
                    onClose={handleCloseModal}
                    title="Mettre à jour un utilisateur"
                >
                    {selectedUser && (
                        <UpdateUser
                            userData={selectedUser}
                            onSuccess={handleUserUpdated}
                            onClose={handleCloseModal}
                        />
                    )}
                </Modal>
            </div>
            <Footer />
        </div>
    );
}

export default AdminDashboard;