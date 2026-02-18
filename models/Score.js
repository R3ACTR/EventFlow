import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
    {
        submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
        judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        criteria: {
            innovation: { type: Number, required: true, min: 0, max: 10 },
            execution: { type: Number, required: true, min: 0, max: 10 },
            presentation: { type: Number, required: true, min: 0, max: 10 },
            impact: { type: Number, required: true, min: 0, max: 10 },
        },
        totalScore: { type: Number, required: true },
        feedback: { type: String },
    },
    { timestamps: true }
);

// Prevent duplicate scoring by the same judge for the same submission
ScoreSchema.index({ submission: 1, judge: 1 }, { unique: true });

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);
