import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        // Email verification fields
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            default: null,
        },
        emailVerificationExpires: {
            type: Date,
            default: null,
        },
        // Password reset fields
        passwordResetToken: {
            type: String,
            default: null,
        },
        passwordResetExpires: {
            type: Date,
            default: null,
        },
        // Account recovery fields
        recoveryToken: {
            type: String,
            default: null,
        },
        recoveryTokenExpires: {
            type: Date,
            default: null,
        },
        recoveryEmailSent: {
            type: Date,
            default: null,
        },
        // Soft delete
        deletedAt: {
            type: Date,
            default: null,
            index: true,
        },
        // Workspace memberships (for future workspace features)
        workspaceMemberships: [{
            workspaceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Workspace',
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member'],
                default: 'member',
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }],
    },
    { timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;