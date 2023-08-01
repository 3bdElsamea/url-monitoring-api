const mongoose = require("mongoose");
const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      updatedAt: false,
    },
    _id: false,
  }
);
const reportSchema = new mongoose.Schema({
  check: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Check",
    required: [true, "Report must belong to a check"],
  },
  status: {
    type: String,
    enum: ["up", "down"],
    required: true,
  },
  availability: {
    type: Number,
    required: true,
    default: 0,
  },
  outages: {
    type: Number,
    default: 0,
  },
  downtime: {
    type: Number,
    default: 0,
  },
  uptime: {
    type: Number,
    default: 0,
  },
  responseTime: {
    type: String,
    default: 0,
  },
});
