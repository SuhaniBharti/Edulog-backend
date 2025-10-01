// const mongoose = require("mongoose");

// const noteSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   date: { type: Date, default: Date.now },
//   // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// });

// module.exports = mongoose.model("Note", noteSchema);


const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Note", noteSchema);
