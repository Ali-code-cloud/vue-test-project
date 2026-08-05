import { api } from "./useApi";

export function useService() {

    const csrf = () => api.get("/sanctum/csrf-cookie");

    
}