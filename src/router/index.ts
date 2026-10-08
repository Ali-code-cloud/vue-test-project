import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'


import HomeLayout from '@layouts/HomeLayout.vue'
import DefaultLayout from '@layouts/DefaultLayout.vue'
import AuthLayout from '@layouts/AuthLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: HomeLayout, // ← Home Layout (with hero section)
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@views/HomeView.vue')
      }
    ]
  },
  {
    path: '/about',
    component: DefaultLayout, // ← Default Layout (no hero)
    children: [
      {
        path: '',
        name: 'about',
        component: () => import('@views/AboutView.vue')
      }
    ]
  },
  {
    path: '/services',
    component: DefaultLayout, // ← Default Layout (no hero)
    children: [
      {
        path: '',
        name: 'services',
        component: () => import('@views/ServicesView.vue')
      }
    ]
  },
  {
    path: '/contact',
    component: DefaultLayout, // ← Default Layout (no hero)
    children: [
      {
        path: '',
        name: 'contact',
        component: () => import('@views/ContactView.vue')
      }
    ]
  },
  {
    path: '/login',
    component: AuthLayout, // ← Auth Layout (no header/footer)
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@views/LoginView.vue')
      }
    ]
  },
  {
    path: '/register',
    component: AuthLayout, // ← Auth Layout (no header/footer)
    children: [
      {
        path: '',
        name: 'register',
        component: () => import('@views/RegisterView.vue')
      }
    ]
  },
  {
    path: '/checkout/:orderId',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'checkout',
        component: () => import('@views/CheckoutView.vue'),
        props: true
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
        component: () => import('../views/NotFoundView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router