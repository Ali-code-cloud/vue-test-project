<template>
    <div class="user-card">
        <div class="avatar">
            <!-- Dynamic avatar with first letter -->
            <span>{{ user.name.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <span class="role" :class="user.role">
                {{ user.role }}
            </span>
        </div>
        <button @click="handleClick" class="btn">
            View Profile
        </button>
    </div>
</template>

<script setup lang="ts">
// Define props with TypeScript
interface User {
    id: number
    name: string
    email: string
    role: 'admin' | 'user' | 'guest'
}

// Props
const props = defineProps<{
    user: User
}>()

// Emits
const emit = defineEmits<{
    (e: 'profile-click', user: User): void
}>()

// Methods
const handleClick = () => {
    emit('profile-click', props.user)
}
</script>

<style scoped>
.user-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: transform 0.2s;
    max-width: 400px;
}

.user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #42b883;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
}

.user-info h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
}

.user-info p {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #666;
}

.role {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.role.admin {
    background: #ff6b6b;
    color: white;
}

.role.user {
    background: #4ecdc4;
    color: white;
}

.role.guest {
    background: #95a5a6;
    color: white;
}

.btn {
    background: #42b883;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.btn:hover {
    background: #3aa876;
}
</style>