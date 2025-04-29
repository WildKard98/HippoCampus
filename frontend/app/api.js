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

// ⭐ Star a term
export const starTerm = async (username, setId, term) => {
    try {
        const response = await api.post('/auth/starredTerms/add', { username, setId, term });
        return response.data;
    } catch (error) {
        console.error('Error starring term:', error);
        throw error;
    }
};

// ❌ Unstar a term
export const unstarTerm = async (username, setId, term) => {
    try {
        const response = await api.post('/auth/starredTerms/remove', { username, setId, term });
        return response.data;
    } catch (error) {
        console.error('Error unstarring term:', error);
        throw error;
    }
};

// Create a new PuzzleSet
export const createPuzzleSet = async (puzzleSetData) => {
    const res = await api.post('/puzzlesets', puzzleSetData);
    return res.data;
};

// Get all public PuzzleSets
export const getPublicPuzzleSets = async () => {
    const res = await api.get('/puzzlesets/public');
    return res.data;
};

// Get PuzzleSets by username
export const getPuzzleSets = async (username) => {
    const res = await api.get(`/puzzlesets/${username}`);
    return res.data;
};

// Update a PuzzleSet
export const updatePuzzleSet = async (id, updatedPuzzleSet) => {
    const res = await api.put(`/puzzlesets/${id}`, updatedPuzzleSet);
    return res.data;
};

// Delete a PuzzleSet
export const deletePuzzleSet = async (id) => {
    const res = await api.delete(`/puzzlesets/${id}`);
    return res.data;
};

// Like/Unlike a PuzzleSet
export const toggleLikePuzzleSet = async (id, username) => {
    const res = await api.put(`/puzzlesets/${id}/like`, { username });
    return res.data;
};



export default api;
