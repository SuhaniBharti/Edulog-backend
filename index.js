
// with sessions

console.log(" THIS INDEX.JS IS RUNNING ");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Note = require("./models/note");
const Subject=require("./models/timetable");
const User = require("./models/user");
const app = express();
const PORT = process.env.PORT || 5000;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");
const chatbotRoutes = require("./chatbot");



dotenv.config();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000",
    "https://edulog-frontend3.onrender.com" ] ,// frontend
    credentials: true
  })
);

app.use(express.json());



app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
//   })
// );

app.set("trust proxy", 1);

app.use(
  session({
    name: "edulog.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

 //mongoose.connect("mongodb://127.0.0.1:27017/notes")
   mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected to notes DB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(" MongoDB connection failed:", err);
  });


// Routes

app.get("/api/auth/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email
  });
});


app.get("/", (req, res) => {
  res.send("Notes API Running");
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ name, email, password });
    await user.save(); // password gets hashed here

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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


app.use("/api", chatbotRoutes);

// // Get all notes
app.get("/api/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
});

//get all subjects
app.get("/api/subjects/", async (req, res) => {
   if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const subjects = await Subject.find({ user: req.user._id });
  res.json(subjects);
});

// Add new note
app.post("/api/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, description, date } = req.body;
  const note = new Note({
    title,
    description,
    date,
    user: req.user._id
  });

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

   if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { Sname, absent, absentDates } = req.body;
  const subject = new Subject({ 
    Sname, 
    absent, 
    absentDates, 
    user:req.user._id
  });
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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const subject = await Subject.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!subject) {
    return res.status(404).json({ message: "Subject not found" });
  }

  res.json({ message: "Subject deleted successfully" });
});


app.post("/api/auth/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});



