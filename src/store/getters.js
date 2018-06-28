const getters = {
  sidebar: state => state.app.sidebar,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  device: state => state.app.device,
  token: state => state.user.token,
  perms: state => state.user.perms,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  uploadUrl: state => state.user.uploadUrl,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters
}
export default getters
