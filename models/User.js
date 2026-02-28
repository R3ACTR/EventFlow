import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        role: {
            type: String,
            enum: ["admin", "organizer", "participant", "mentor", "judge"],
            default: "participant",
        },
        bio: String,
        avatar: String,
        avatarUrl: {
            type: String,
            default: ""
        },

        // Profile Info
        skills: [String],
        socialLinks: {
            github: String,
            linkedin: String,
            website: String,
        },
        
        // Event Following/Watchlist
        followingEvents: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Event" 
        }],
        
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

// Soft delete middleware - using async/await pattern for Mongoose 8+
async function excludeSoftDeleted() {
    const options = this.getOptions?.() || {};
    if (!options.includeDeleted) {
        this.where({ isDeleted: { $ne: true } });
    }
}

UserSchema.pre("find", { document: false, query: true }, excludeSoftDeleted);
UserSchema.pre("findOne", { document: false, query: true }, excludeSoftDeleted);
UserSchema.pre("findOneAndUpdate", { document: false, query: true }, excludeSoftDeleted);
UserSchema.pre("countDocuments", { document: false, query: true }, excludeSoftDeleted);

export default mongoose.models.User || mongoose.model("User", UserSchema);
