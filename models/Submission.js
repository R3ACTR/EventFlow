
import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
    {
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        repoLink: { type: String, required: true },
        demoLink: { type: String },
        submittedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    },
    { timestamps: true }
);

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
