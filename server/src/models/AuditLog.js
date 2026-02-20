import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: String,
    userRole: String,
    action: {
        type: String,
        required: true,
        enum: [
            'login', 'logout',
            'menu_create', 'menu_update', 'menu_delete',
            'order_update', 'order_cancel', 'order_refund',
            'user_create', 'user_update', 'user_delete', 'user_balance_update',
            'staff_recruit', 'staff_update', 'staff_delete',
            'announcement_create', 'announcement_update',
            'utr_verify', 'utr_reject',
            'selfie_approve', 'selfie_reject',
            'settings_update',
            'data_export',
            'bulk_operation'
        ]
    },
    resource: String, // e.g., 'menu_item', 'order', 'user'
    resourceId: String, // ID of the affected resource
    details: mongoose.Schema.Types.Mixed, // Additional context
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: ['success', 'failure'],
        default: 'success'
    },
    errorMessage: String
});

// Index for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// Auto-delete logs older than 90 days (optional)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
