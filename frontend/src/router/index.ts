import { createRouter, createWebHistory } from 'vue-router'
import PostsPage from '@/views/PostsPage.vue'
import AuthorsPage from '@/views/AuthorsPage.vue'
import PostDetailsPage from '@/views/PostDetailsPage.vue'
import UserLoginPage from '@/views/UserLoginPage.vue'
import NotFoundPage from '@/views/NotFoundPage.vue'
import UsersPage from '@/views/UsersPage.vue'
import AuthorPostsPage from '@/views/AuthorPostsPage.vue'
import { useAuthStore } from '@/stores/authStore'
import SitemapPage from '@/views/SitemapPage.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/posts' },
    { path: '/posts', name: 'posts', component: PostsPage },
    { path: '/posts/:id', name: 'post-details', component: PostDetailsPage },
    { path: '/authors', name: 'authors', component: AuthorsPage },
    { path: '/authors/:id', name: 'author-posts', component: AuthorPostsPage },
    { path: '/login', name: 'login', component: UserLoginPage },
    {
      path: '/users',
      name: 'users',
      component: UsersPage,
      meta: { requiresAdmin: true }
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
    { path: '/sitemap', name: 'sitemap', component: SitemapPage }

  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isUserLoggedIn && to.path !== '/login') {
    next('/login')
    return
  }

  if (to.path === '/login' && authStore.isUserLoggedIn) {
    next('/posts')
    return
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/posts')
    return
  }

  next()
})

export default router
