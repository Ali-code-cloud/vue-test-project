import { api } from "./useApi";

export function useAuth() {
    const csrf = () => api.get("/sanctum/csrf-cookie");
    const login = (credentials) => {
        await csrf();
        return api.post("/login", credentials);
    };
    const logout = () => {
        await csrf();
        return api.post("/logout");
    };
    const user = () => {
        return api.get("/api/user");
    };
    return {
        login,
        logout,
        user,
    };
}