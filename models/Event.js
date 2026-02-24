import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [2000, "Description cannot exceed 2000 characters"]
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },
        registrationDeadline: {
            type: Date,
            required: [true, "Registration deadline is required"]
        },
        logo: String,
        isPublic: { type: Boolean, default: true },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["draft", "upcoming", "ongoing", "completed"],
            default: "draft",
        },
        minTeamSize: { type: Number, default: 2 },
        maxTeamSize: { type: Number, default: 4 },

        judges: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        rules: [String],
        tracks: [String],

        // Comprehensive Event Details
        judgingCriteria: [{
            name: { type: String, required: true },
            description: String,
            maxScore: { type: Number, default: 10 }
        }],
        prizes: [{
            title: String, // e.g., "1st Place"
            description: String,
            amount: String, // Cash or value
        }],
        sponsors: [{
            name: String,
            logo: String,
            website: String,
            tier: { type: String, enum: ["platinum", "gold", "silver", "bronze"], default: "bronze" }
        }],
        certificateTemplate: {
            backgroundUrl: String,
            elements: [{
                type: { type: String, enum: ['text', 'image'], default: 'text' },
                content: String, // e.g., "{{RECIPIENT_NAME}}"
                x: Number,
                y: Number,
                fontSize: { type: Number, default: 24 },
                color: { type: String, default: '#000000' },
                align: { type: String, enum: ['left', 'center', 'right'], default: 'left' }
            }]
        }

    },
    { timestamps: true }
);

// Index for faster queries
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ organizer: 1 });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
