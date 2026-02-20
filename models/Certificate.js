import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    recipientName: {
      type: String,
      required: true,
    },

    recipientEmail: {
      type: String,
    },

    role: {
      type: String,
      enum: ["participant", "winner", "mentor", "organizer","judge"],
      default: "participant",
    },

    certificateUrl: {
      type: String,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Certificate = mongoose.models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);

export default Certificate;
