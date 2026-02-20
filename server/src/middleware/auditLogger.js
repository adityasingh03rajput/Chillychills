import AuditLog from '../models/AuditLog.js';

/**
 * Middleware to log admin actions for audit trail
 */
export const logAuditAction = (action, resource = null) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to capture response
        res.json = function (data) {
            // Log the action after successful response
            if (res.statusCode >= 200 && res.statusCode < 300) {
                AuditLog.create({
                    userId: req.user?.id || 'system',
                    userName: req.user?.name,
                    userRole: req.user?.role,
                    action,
                    resource,
                    resourceId: req.params.id || req.body.id || data?.id,
                    details: {
                        method: req.method,
                        path: req.path,
                        body: sanitizeBody(req.body),
                        query: req.query
                    },
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'success'
                }).catch(err => console.error('Audit log error:', err));
            } else {
                AuditLog.create({
                    userId: req.user?.id || 'system',
                    userName: req.user?.name,
                    userRole: req.user?.role,
                    action,
                    resource,
                    details: {
                        method: req.method,
                        path: req.path
                    },
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    status: 'failure',
                    errorMessage: data?.error || 'Unknown error'
                }).catch(err => console.error('Audit log error:', err));
            }

            return originalJson(data);
        };

        next();
    };
};

/**
 * Sanitize request body to remove sensitive data from logs
 */
function sanitizeBody(body) {
    if (!body) return {};
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });
    
    return sanitized;
}
