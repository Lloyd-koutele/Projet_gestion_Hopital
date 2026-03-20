import api from "../api";

export const createAdmin = async (adminData) => {
    const response = await api.post('/admin/create-admins', adminData);
    return response.data;
};

export const updateAdmin = async (id, adminData) => {
    const response = await api.put(`/admin/update-admins/${id}`, adminData);
    return response.data;
};

export const creataMedecin = async (medecinData) => {
    const response = await api.post('/admin/create-medecins', medecinData);
    return response.data;
};

export const updateMedecin = async (id, medecinData) => {
    const response = await api.put(`/admin/update-medecins/${id}`, medecinData);
    return response.data;
};

export const creataChercheur = async (chercheurData) => {
    const response = await api.post('/admin/create-chercheurs', chercheurData);
    return response.data;
};

export const updateChercheur = async (id, chercheurData) => {
    const response = await api.put(`/admin/update-chercheurs/${id}`, chercheurData);
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};
