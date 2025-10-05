import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'concrete-grace',
      component: () => import('@/components/ConcreteGrace.vue')
    }
  ],
})

export default router
