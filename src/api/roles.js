import api from './axios'

export const rolesApi = {
  /** GET /api/roles */
  index() {
    return api.get('/api/roles')
  },

  /** GET /api/roles/:id */
  show(id) {
    return api.get(`/api/roles/${id}`)
  },

  /** POST /api/roles/:id/permissions — sincroniza permisos del rol */
  syncPermissions(roleId, permissionIds) {
    return api.post(`/api/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    })
  },
}
