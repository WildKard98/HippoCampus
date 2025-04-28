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
        const response = await api.get(`/studysets/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching study sets:', error);
        throw error;
    }
};

// Function to fetch public study sets
export const getPublicSets = async () => {
    try {
        const response = await api.get('/studysets/public');
        return response.data;
    } catch (error) {
        console.error('Error fetching public study sets:', error);
        throw error;
    }
};

export const toggleLikeSet = async (id, username) => {
    try {
        const response = await api.put(`/studysets/${id}/like`, { username });
        return response.data;
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
};


export default api;
