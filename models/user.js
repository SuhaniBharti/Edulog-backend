// const mongoose=require("mongoose");

// const userSchema=new mongoose.Schema({
//     name:String,
//     email:{
//         type:String,
//         unique:true
//     },
//     password:String,
// });
// module.exports=mongoose.model("User",userSchema)


const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
  username: {          // 👈 REQUIRED by passport-local-mongoose
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  }
});

// tell passport to use `email` as username field
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);
