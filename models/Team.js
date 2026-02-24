import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String }, // Team pitch or description
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        inviteCode: { type: String, unique: true },
        maxMembers: { type: Number, default: 4 },

        // Future-proofing features
        tags: [String], // e.g., ["React", "AI", "Beginner Friendly"]
        status: { type: String, enum: ["active", "disqualified", "archived"], default: "active" },
        isLookingForMembers: { type: Boolean, default: true },
        pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users asking to join
        assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Mentor guiding this team
        mentorRequested: { type: Boolean, default: false }, // Team requested mentor help
        mentorRequestMessage: { type: String }, // Message to mentors
    },
    { timestamps: true }
);

// Virtual for member count
TeamSchema.virtual('memberCount').get(function () {
    return this.members.length + 1; // +1 for leader
});

// Check if team is full
TeamSchema.virtual('isFull').get(function () {
    return (this.members.length + 1) >= (this.maxMembers || 4);
});

// Generate unique invite code before saving
TeamSchema.pre('save', function () {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }
});

// Index for faster queries
TeamSchema.index({ event: 1 });
TeamSchema.index({ leader: 1 });
TeamSchema.index({ 'members': 1 });

// Force recompilation in dev to catch schema changes
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Team;
}

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
