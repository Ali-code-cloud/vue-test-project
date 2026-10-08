// This composable is kept for backward compatibility.
// All auth logic now lives in the Pinia auth store: @/stores/auth
// For API calls, import api directly from @/composables/useApi
import api from './useApi'

export function useAuth() {
    const csrf = () => api.get('/sanctum/csrf-cookie')

    const login = async (credentials) => {
        await csrf()
        return api.post('/api/user/auth/login', credentials)
    }

    const logout = async () => {
        return api.post('/api/user/auth/logout')
    }

    const user = () => {
        return api.get('/api/user')
    }

    return {
        login,
        logout,
        user,
    }
}