// Seed script to add demo events
// Run with: node scripts/seed-events.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eventflow";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: Date,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["draft", "upcoming", "ongoing", "completed"],
    default: "draft",
  },
  rules: [String],
  tracks: [String],
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

const demoEvents = [
  {
    title: "Hackathon 2026",
    description: "Join us for the biggest hackathon of the year! Build innovative solutions and win amazing prizes.",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-15"),
    registrationDeadline: new Date("2026-02-28"),
    status: "upcoming",
    rules: [
      "Teams of 2-5 members",
      "Open to all skill levels",
      "Must use provided API",
      "Submit before deadline"
    ],
    tracks: ["AI/ML", "Web Development", "Mobile Apps", "Blockchain"]
  },
  {
    title: "Code Sprint 2026",
    description: "A 48-hour coding sprint to build impactful projects for social good.",
    startDate: new Date("2026-04-10"),
    endDate: new Date("2026-04-12"),
    registrationDeadline: new Date("2026-04-08"),
    status: "upcoming",
    rules: [
      "Teams of 3-4 members",
      "Theme: Social Impact",
      "Open source projects welcome"
    ],
    tracks: ["Social Impact", "Sustainability", "Education", "Healthcare"]
  },
  {
    title: "AI Innovation Challenge",
    description: "Push the boundaries of AI with cutting-edge machine learning solutions.",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-31"),
    registrationDeadline: new Date("2026-04-25"),
    status: "upcoming",
    rules: [
      "Individual or teams up to 3",
      "Must use AI/ML technologies",
      "Demo video required"
    ],
    tracks: ["Computer Vision", "NLP", "Generative AI", "Robotics"]
  }
];

async function seedEvents() {
  try {
    process.stdout.write("Connecting to MongoDB...\n");
    await mongoose.connect(MONGODB_URI);
    process.stdout.write("Connected to MongoDB\n");

    // Check if events already exist
    const existingCount = await Event.countDocuments();
    if (existingCount > 0) {
      process.stdout.write(`Found ${existingCount} existing events.\n`);
      
      // Optionally clear existing events
      // await Event.deleteMany({});
    }

    // Create demo events
    const createdEvents = await Event.insertMany(demoEvents);
    process.stdout.write(`Created ${createdEvents.length} demo events:\n`);
    
    createdEvents.forEach((event, index) => {
      process.stdout.write(`  ${index + 1}. ${event.title} (${event.status})\n`);
    });

    process.stdout.write("\nSeed completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding events:", error);
    process.exit(1);
  }
}

seedEvents();
