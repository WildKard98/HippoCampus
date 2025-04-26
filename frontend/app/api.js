import axios from 'axios';

// 1. Create a base axios instance first
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production'
        ? 'https://hippocampus.onrender.com/api'
        : 'http://localhost:5001/api',
});

// 2. Create your API functions
export const createStudySet = async (studySetData) => {
    try {
        const response = await api.post('/studysets', studySetData);
        return response.data;
    } catch (error) {
        console.error('Error creating study set:', error);
        throw error;
    }
};

export const updateStudySet = async (id, updatedData) => {
    try {
        const response = await api.put(`/studysets/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error updating study set:', error);
        throw error;
    }
};

export const getStudySets = async (username) => {
    try {
        const response = await api.get(`/studysets/${username}`); // 🔥 NO /user/ anymore
        return response.data;
    } catch (error) {
        console.error('Error fetching study sets:', error);
        throw error;
    }
};


// 3. Export the base api instance if you want to reuse later
export default api;
