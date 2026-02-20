
import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema({
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: Number, required: true },
    feedback: { type: String },
    criteriaScores: {
        innovation: { type: Number, default: 0 },
        feasibility: { type: Number, default: 0 },
        presentation: { type: Number, default: 0 },
        impact: { type: Number, default: 0 },
        documentation: { type: Number, default: 0 }
    },
    evaluatedAt: { type: Date, default: Date.now }
});

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

        // Detailed Judging Scores
        evaluations: [EvaluationSchema],

        // Aggregated stats for leaderboard
        averageScore: { type: Number, default: 0 },
        totalScore: { type: Number, default: 0 }, // Sum of all scores
        judgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of judge IDs for easy querying

        position: { type: Number, default: 0 }, // Rank in the event
    },
    { timestamps: true }
);

// Force recompilation in dev to catch schema changes
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Submission;
}

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
