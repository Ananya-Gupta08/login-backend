import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentRole: {
      type: String,
      enum: ["staff", "manager", "admin"],
      default: "staff",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed", "Rejected"],
      default: "Open",
    },

    escalationLevel: {
      type: Number,
      default: 1,
    },

    history: [
      {
        action: String,
        role: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);