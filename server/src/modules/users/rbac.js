import logger from "../../utils/logger.js";

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    // Admin can access all routes
    allowedRoutes: [{
      method: '*',
      route: '*'
    }],
    canManageRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]
  },
  [ROLES.MANAGER]: {
    allowedRoutes: [
      {
        method: 'POST',
        route: '/users'
      },{
        method: 'GET',
        route: '/users',
      },{
        method: 'GET',
        route: '/users/:id',
      },{
        method: 'PUT',
        route: '/users',
      },{
        method: 'GET',
        route: '/users/:id',
      },
      {
        method: 'GET',
        route: '/a/1',
      },
    ],
    canManageRoles: [ROLES.USER]  // Managers can only manage users
  },
  [ROLES.USER]: {
    allowedRoutes: [
      {
        method: 'GET',
        route: '/users/:id',
      },
    ],
    canManageRoles: []  // Users cannot manage anyone
  }
};

// Middleware to check role-based access
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.session.passport || !req.session.passport.user) {
      return res.status(401).json({ detail: 'Authentication required' })
    }

    const userRole = req.session.passport.user.role

    if (!allowedRoles.includes(userRole)) {
      logger.debug('user role:', userRole)
      logger.debug('allowed roles:', allowedRoles)
      return res.status(403).json({ detail: 'Insufficient permissions' })
    }

    next()
  }
}

export function checkPermissions() {
  return (req, res, next) => {
    if (!req.session.passport || !req.session.passport.user) {
      return res.status(401).json({ detail: 'Authentication required' })
    }

    const userRole = req.session.passport.user.role || ''
    // TODO validate permission
    const userPermissions = ROLE_PERMISSIONS[userRole]
    const requestedPath = req.baseUrl + req.path
    const requestedMethod = req.method

    // Admins have access to everything
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // Check if route is allowed
    const isAllowed = userPermissions.allowedRoutes.some(r => {
      const isMethodAllowed = r.method === requestedMethod
      const isRouteAllowed = r.route === requestedPath
      return isMethodAllowed && isRouteAllowed
    });

    if (!isAllowed) {
      return res.status(403).json({ detail: 'Access denied for this route' });
    }

    // // Checks for user management
    // if (requestedPath.startsWith('/users') && 
    //     (requestedMethod === 'POST' || requestedMethod === 'PUT' || 
    //      requestedMethod === 'PATCH' || requestedMethod === 'DELETE')) {

    //   const targetRole = req.body.role || ROLES.USER;
    //   if (!userPermissions.canManageRoles.includes(targetRole)) {
    //     return res.status(403).json({ detail: 'Cannot manage users with this role' });
    //   }

    //   if (requestedPath.includes('/users/') && requestedMethod !== 'POST') {
    //     const targetUserId = req.params.id;
    //     if (targetUserId && targetUserId !== req.session.user.id.toString() && 
    //         userRole !== ROLES.ADMIN) {
    //       return res.status(403).json({ detail: 'Can only modify your own account' });
    //     }
    //   }
    // }

    next();
  };
}

export function canManageRole(userRole, targetRole) {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return userPermissions.canManageRoles.includes(targetRole);
}

export { ROLES };