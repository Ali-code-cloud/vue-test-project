// import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
// import UsersPage from '@/views/UsersPage.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'home',
//       component: HomeView,
//     },
//     {
//       path: '/about',
//       name: 'about',
//       component: () => import('../views/AboutView.vue'),
//     },
//     {
//       path: '/users',
//       name: 'users',
//       component: UsersPage
//       // component: () => import('../views/UsersPage.vue') // Lazy loading
//     },
//   ],
// })

// export default router

import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "",
        component: HomeView,
      },
    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});