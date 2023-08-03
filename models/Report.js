const mongoose = require("mongoose");
const Email = require("../services/mailService");
const User = require("./User");

const historySchema = new mongoose.Schema(
  {
    report_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: [true, "History must belong to a report"],
    },
    status: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    // Response time for each check request
    responseTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      updatedAt: false,
    },
  }
);
const reportSchema = new mongoose.Schema(
  {
    check: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Check",
      required: [true, "Report must belong to a check"],
    },
    status: {
      type: String,
      enum: ["up", "down", "not checked"],
      default: "not checked",
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
    // Average response time
    responseTime: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual history field to get all history of a report
reportSchema.virtual("history", {
  ref: "History",
  foreignField: "report_id",
  localField: "_id",
});

reportSchema.pre(/^find/, function (next) {
  this.populate({
    path: "check",
    select: "owner name url path timeout interval threshold",
  });
  next();
});

reportSchema.methods = {
  async sendStatusEmail() {
    console.log(this.check.url);
    const user = await User.findById(this.check.owner);
    await new Email(user).sendStatusChangeEmail(this.status, this.check.name);
  },
};

const History = mongoose.model("History", historySchema);
const Report = mongoose.model("Report", reportSchema);

module.exports = { Report, History };
