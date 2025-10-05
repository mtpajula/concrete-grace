import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/concrete-grace'
    },
    {
      path: '/concrete-grace',
      name: 'concrete-grace',
      component: () => import('@/components/ConcreteGrace.vue')
    }
  ],
})

export default router
