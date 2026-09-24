import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import layouts
import HomeLayout from '@/layouts/HomeLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: HomeLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue')
      }
    ]
  },
  {
    path: '/about',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'about',
        component: () => import('@/views/AboutView.vue')
      }
    ]
  },
  {
    path: '/services',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'services',
        component: () => import('@/views/ServicesView.vue')
      },
      {
        path: 'category/:id',
        name: 'category-services',
        component: () => import('@/views/CategoryServicesView.vue')
      }
    ]
  },
  {
    path: '/cart',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'cart',
        component: () => import('@/views/CartView.vue')
      }
    ]
  },
  {
    path: '/contact',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'contact',
        component: () => import('@/views/ContactView.vue')
      }
    ]
  },
  {
    path: '/blog',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'blog',
        component: () => import('@/views/BlogView.vue')
      }
    ]
  },
  {
    path: '/terms',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'terms',
        component: () => import('@/views/TermsView.vue')
      }
    ]
  },
  {
    path: '/privacy',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'privacy',
        component: () => import('@/views/PrivacyView.vue')
      }
    ]
  },
  {
    path: '/login',
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/LoginView.vue')
      }
    ]
  },
  {
    path: '/register',
    redirect: '/login'
  },
  {
    path: '/forgot-password',
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      {
        path: '',
        name: 'forgot-password',
        component: () => import('@/views/ForgotPasswordView.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue')
      }
    ]
  },
  // 404 - Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: DefaultLayout,
    children: [
      {
        path: '',
        component: () => import('@/views/NotFoundView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Route Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (authStore.isAuthenticated) {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router