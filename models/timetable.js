


const mongoose = require("mongoose");

const RoutineSchema = new mongoose.Schema({
  Sname: String,
  absent: Number,
  absentDates: [Date],   //  store actual absent dates
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Routine", RoutineSchema);
