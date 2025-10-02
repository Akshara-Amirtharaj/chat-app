import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        // Channel support
        channelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        // Message type
        type: {
            type: String,
            enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'TASK_UPDATE'],
            default: 'TEXT',
        },
        // Thread support
        parentMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        threadCount: {
            type: Number,
            default: 0,
        },
        // Reactions
        reactions: [{
            emoji: String,
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            addedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        // Message editing
        editedAt: {
            type: Date,
        },
        editHistory: [{
            text: String,
            editedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        // Ownership transfer fields for cascade deletion
        ownershipTransferred: {
            type: Boolean,
            default: false,
        },
        originalSenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        transferredAt: {
            type: Date,
            default: null,
        },
    },
    {timestamps: true}
);

const Message = mongoose.model("Message",messageSchema)
export default Message;