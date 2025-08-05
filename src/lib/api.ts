import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1",
    // withCredentials: true,
})


API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;