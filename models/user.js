// const mongoose=require("mongoose");

// const userSchema=new mongoose.Schema({
//     name:String,
//     email:{
//         type:String,
//         unique:true
//     },
//     password:String,
// });
// module.exports=mongoose.model("User",userSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String
});

// hash password before saving (salting included)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// method to compare password during login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
