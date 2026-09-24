<template>
    <div class="users-page">
        <header class="page-header">
            <h1>👥 Users Directory</h1>
            <p>Total Users: {{ users.length }}</p>
        </header>

        <!-- Grid of user cards -->
        <div class="users-grid">
            <UserCard v-for="user in users" :key="user.id" :user="user" @profile-click="handleProfileClick" />
        </div>

        <!-- Optional: Show when no users -->
        <div v-if="users.length === 0" class="empty-state">
            <p>No users available</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserCard from '@/components/UserCard.vue'
import { showInfoToast } from '@/utils/alert'

// Define user type
interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'user' | 'guest'
}

// Reactive data - sample users
const users = ref<User[]>([
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user'
    },
    {
        id: 3,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'user'
    },
    {
        id: 4,
        name: 'Bob Williams',
        email: 'bob@example.com',
        role: 'guest'
    }
])

// Event handler
const handleProfileClick = (user: User) => {
    showInfoToast(`Viewing profile of ${user.name}`)
}
</script>

<style scoped>
.users-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #eee;
}

.page-header h1 {
    margin: 0;
    color: #2c3e50;
}

.page-header p {
    margin: 0;
    color: #666;
    font-size: 16px;
}

.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.empty-state {
    text-align: center;
    color: #666;
    padding: 40px;
    background: #f9f9f9;
    border-radius: 8px;
}
</style>