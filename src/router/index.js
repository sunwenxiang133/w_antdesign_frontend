import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/MainLayout.vue'),
    children: [
      {
        path: '/project',
        component: () => import('../components/projectController.vue')
      },
      {
        path: '/model',
        component: () => import('../components/modelController.vue')
      },
      {
        path: '/deploy',
        component: () => import('../components/deployController.vue')
      },
      {
        path: '/device:id',
        component: () => import('../components/HelloWorld.vue')
      },
      {
        path: '/',
        redirect: '/project'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 重定向不报错
const originalPush = router.push
router.push = function push(location, onResolve, onReject) {
  // NOTE: 在 Vue Router 中，当使用 router.push 或 router.replace 方法进行路由导航时，如果目标路由与当前路由相同，Vue Router 会在内部抛出一个错误。这是因为，从逻辑上讲，尝试导航到当前已处于激活状态的路由是无效的操作。在 Vue Router 3.x 中，这种行为通常不会影响用户体验，因为这个错误通常不会被处理。但是，从 Vue Router 3.1.0 版本开始，这种行为改变了，如果你没有显式地捕获并处理这个错误，它可能会导致 Promise rejection 警告。
  if (onResolve || onReject) console.log('存在 savedPosition')
  return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

export default router
