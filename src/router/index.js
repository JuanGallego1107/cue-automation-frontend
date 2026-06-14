import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// ── Vistas públicas ────────────────────────────────────────────────────────
const LoginView = () => import('@/views/LoginView.vue')

// ── Vistas protegidas ──────────────────────────────────────────────────────
const DashboardView = () => import('@/views/DashboardView.vue')

// ── Admin ──────────────────────────────────────────────────────────────────
const UsersView   = () => import('@/views/admin/UsersView.vue')
const RolesView   = () => import('@/views/admin/RolesView.vue')
const SubjectsView = () => import('@/views/admin/SubjectsView.vue')

// ── Submissions (Revisiones de documentos) ────────────────────────────────
const SubmissionsListView = () => import('@/views/submissions/SubmissionsListView.vue')
const SubmissionUploadView = () => import('@/views/submissions/SubmissionUploadView.vue')
const SubmissionDetailView = () => import('@/views/submissions/SubmissionDetailView.vue')

// ── Error ──────────────────────────────────────────────────────────────────
const NotFoundView    = () => import('@/views/NotFoundView.vue')
const ForbiddenView   = () => import('@/views/ForbiddenView.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },

  // ── Pública ──────────────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true },
  },

  // ── Protegidas ───────────────────────────────────────────────────────────
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },

  // ── Submissions ───────────────────────────────────────────────────────────
  {
    path: '/submissions',
    name: 'submissions.list',
    component: SubmissionsListView,
    meta: { requiresAuth: true, roles: ['admin', 'coordinator'] },
  },
  {
    path: '/submissions/upload',
    name: 'submissions.upload',
    component: SubmissionUploadView,
    meta: { requiresAuth: true, roles: ['coordinator'] },
  },
  {
    path: '/submissions/:uuid',
    name: 'submissions.detail',
    component: SubmissionDetailView,
    meta: { requiresAuth: true, roles: ['admin', 'coordinator'] },
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: UsersView,
    meta: { requiresAuth: true, requiresPermission: 'users.view' },
  },
  {
    path: '/admin/roles',
    name: 'AdminRoles',
    component: RolesView,
    meta: { requiresAuth: true, requiresPermission: 'roles.manage' },
  },
  {
    path: '/admin/subjects',
    name: 'AdminSubjects',
    component: SubjectsView,
    meta: { requiresAuth: true, requiresPermission: 'subjects.view' },
  },

  // ── Errores ───────────────────────────────────────────────────────────────
  { path: '/403', name: 'Forbidden', component: ForbiddenView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ── Guard global ─────────────────────────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  // 1. Ruta requiere autenticación y el usuario NO está logueado
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 2. Ruta es solo para invitados y el usuario YA está logueado
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // 3. Ruta requiere un permiso específico
  if (to.meta.requiresPermission && !auth.hasPermission(to.meta.requiresPermission)) {
    return next({ name: 'Forbidden' })
  }

  // 4. Ruta requiere roles específicos
  if (to.meta.roles) {
    const roleName = auth.user?.role?.name
    const normalizedRole = roleName === 'Administrador' ? 'admin' : (roleName === 'Coordinador' ? 'coordinator' : null)
    if (!normalizedRole || !to.meta.roles.includes(normalizedRole)) {
      return next({ name: 'Forbidden' })
    }
  }

  next()
})

export default router
