// const mongoose=require("mongoose");

// const RoutineSchema=new mongoose.Schema({
//     Sname:String,
//     absent:{
//         type:Number,
       
//     },
//     //   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } 
// });
// module.exports=mongoose.model("Routine",RoutineSchema)


// models/timetable.js
// const mongoose = require("mongoose");

// const RoutineSchema = new mongoose.Schema({
//   Sname: String,
//   absent: Number,
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }  // ✅ link subject to user
// });

// module.exports = mongoose.model("Routine", RoutineSchema);


const mongoose = require("mongoose");

const RoutineSchema = new mongoose.Schema({
  Sname: String,
  absent: Number,
  absentDates: [Date],   // ✅ store actual absent dates
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Routine", RoutineSchema);
