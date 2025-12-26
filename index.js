
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Note = require("./models/note");
const Subject=require("./models/timetable");
const User = require("./models/user");
const app = express();
const PORT = process.env.PORT || 5000;

const dotenv = require("dotenv");
const chatbotRoutes = require("./chatbot");
const session = require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local");


dotenv.config();

const sessionoptions = {
  secret: "edulog-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
};
// Middleware
app.use(cors());
app.use(express.json());
app.use(session(sessionoptions));
app.use(passport.initialize());
app.use(passport.session());
// Connect to your "notes" DB
// mongoose.connect(process.env.MONGO_URI)
 mongoose.connect("mongodb://127.0.0.1:27017/notes")
  .then(() => console.log("✅ MongoDB connected to notes DB"))
  .catch(err => console.log(err));

  app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}); 



// Routes

app.get("/", (req, res) => {
  res.send("Notes API Running 🚀");
});

app.use("/api", chatbotRoutes);

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Get all notes
app.get("/api/notes/:userId", async (req, res) => {
  const notes = await Note.find({ user: req.params.userId });
  res.json(notes);
});
//get all subjects
app.get("/api/subjects/:userId", async (req, res) => {
  const subjects = await Subject.find({ user: req.params.userId });
  res.json(subjects);
});

// Add new note
app.post("/api/notes", async (req, res) => {
  const { title, description, date, userId } = req.body;  // ✅ expect userId
  const note = new Note({ title, description, date, user: userId });
  await note.save();
  res.status(201).json(note);
});

//update 
app.patch("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating note" });
  }
});

// Get a single note by ID
app.get("/api/notes/note/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Error fetching note" });
  }
});

// Mark note as completed or not
app.patch("/api/notes/:id/complete", async (req, res) => {
  const { completed } = req.body;
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Error updating note" });
  }
});


// DELETE /api/notes/:noteId
// DELETE /api/notes/:id
app.delete("/api/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
});


//ADD new subject
app.post("/api/subjects", async (req, res) => {
  const { Sname, absent, absentDates, user } = req.body;
  const subject = new Subject({ Sname, absent, absentDates, user });
  await subject.save();
  res.status(201).json(subject);
});


app.get("/api/subject/:id", async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/api/subjects/:subjectId/dates", async (req, res) => {
  const subject = await Subject.findById(req.params.subjectId);
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  res.json(subject.absentDates);
});

app.delete("/api/subjects/:id", async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting subject" });
  }
});


// //signup
// app.post("/api/auth/signup",async(req,res)=>{
//   try{
//     const{name,email,password}=req.body;
//     const existing=await User.findOne({email});
//     if(existing) return res.status(400).json({message:"Email already exists"});

//     const user=new User({name,email,password});
//     await user.save();
//     console.log("Saving user:", req.body);

//     res.json({message:"Signup successful",user});
//   }catch(err){
//     res.status(500).json({message:"server error"});
//   }
// });

// //login
// app.post("/api/auth/login",async(req,res)=>{
//   try{
//     const {email,password}=req.body;
//     const user=await User.findOne({email,password});
//     if(!user) return res.status(400).json({message:"invalid credentials"});

//     res.json({message:"Login successful",user});
    
//   }catch(err){
//     res.status(500).json({message:"Server error"});
//   }
// });

//signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({
      username: email,   // passport uses this
      email
    });

    const registeredUser = await User.register(user, password);

    res.status(201).json({
      message: "Signup successful",
      user: registeredUser
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//login
app.post(
  "/api/auth/login",
  passport.authenticate("local"),
  (req, res) => {
    res.json({
      message: "Login successful",
      user: req.user
    });
  }
);



