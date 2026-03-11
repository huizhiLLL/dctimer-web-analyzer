import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import FilterView from '../views/FilterView.vue'
import ReportView from '../views/ReportView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/filters',
      name: 'filters',
      component: FilterView,
    },
    {
      path: '/report',
      name: 'report',
      component: ReportView,
    },
  ],
})

export default router
