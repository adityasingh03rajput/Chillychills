import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findOne({ id: decoded.userId });

        if (!user) {
            return res.status(401).json({ error: 'User not found. Token invalid.' });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            role: user.role,
            name: user.name
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token signature.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({ error: 'Authentication failed.' });
    }
};

/**
 * Role-Based Access Control Middleware
 * Restricts access to specific roles
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. ${req.user.role} role cannot access this resource.`,
                requiredRoles: allowedRoles
            });
        }

        next();
    };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ id: decoded.userId });

            if (user) {
                req.user = {
                    id: user.id,
                    role: user.role,
                    name: user.name
                };
            }
        }
    } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
    }

    next();
};
