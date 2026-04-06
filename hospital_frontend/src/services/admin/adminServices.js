import api from "../api";

export const createAdmin = async (adminData) => {
    try {
        const response = await api.post('/admin/create-admins', adminData);
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const updateAdmin = async (id, adminData) => {
    try {
        if (!id) {
            throw new Error('ID utilisateur manquant');
        }

        const response = await api.put(`/admin/update-admins/${id}`, adminData);
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const createMedecin = async (medecinData) => {
    try {
        const response = await api.post('/admin/create-medecins', medecinData);
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const updateMedecin = async (id, medecinData) => {
    try {
        if (!id) {
            throw new Error('ID utilisateur manquant');
        }

        const response = await api.put(`/admin/update-medecins/${id}`, medecinData);
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const createChercheur = async (chercheurData) => {
    try {
        const response = await api.post('/admin/create-chercheurs', chercheurData);
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const updateChercheur = async (id, chercheurData) => {
    try {
        if (!id) {
            throw new Error('ID utilisateur manquant');
        }

        const response = await api.put(`/admin/update-chercheurs/${id}`, chercheurData);
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        if (!userId) {
            throw new Error('ID utilisateur manquant');
        }

        const response = await api.put('/admin/users/status', {
            userId: userId,
            actif: status
        });
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};

export const deleteUser = async (userId) => {
    try {
        if (!userId) {
            throw new Error('ID utilisateur manquant');
        }

        const response = await api.delete(`/admin/users/${userId}`, { userId: userId });
        return response.data;
    } catch (error) {
        console.error('Détails de l\'erreur:', error.response?.data || error);
        throw error.response?.data?.message
            ? new Error(error.response.data.message)
            : error;
    }
};
