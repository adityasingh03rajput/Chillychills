import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'cook', 'manager'],
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    email: String,
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('User', userSchema);
