const express = require("express");
const mongoose = require("mongoose");
const Note = require("./models/note");
const Subject = require("./models/timetable");
const router = express.Router();

router.post("/chatbot", async (req, res) => {
  const { message, userId } = req.body;

  try {
    if (!userId) {
      return res.json({ reply: "Please log in first to access your data." });
    }

const userObjectId = new mongoose.Types.ObjectId(String(userId));

    let reply = "";

    // Ongoing tasks
    if (/ongoing/i.test(message)) {
      const ongoing = await Note.find({ user: userObjectId, completed: false });
      reply = ongoing.length
        ? ` You have ${ongoing.length} ongoing task(s):\n${ongoing.map(t => "• " + t.title).join("\n")}`
        : " You have no ongoing tasks!";
    }

    // Completed tasks
    else if (/completed/i.test(message)) {
      const completed = await Note.find({ user: userObjectId, completed: true });
      reply = completed.length
        ? ` You’ve completed ${completed.length} task(s):\n${completed.map(t => "• " + t.title).join("\n")}`
        : "No completed tasks yet — keep going!";
    }

    // Absence details
    else if (/absent/i.test(message)) {
      const match = message.match(/in (.+)/i);
      const subjectName = match ? match[1].trim() : null;

      if (subjectName) {
        const subject = await Subject.findOne({
          user: userObjectId,
          Sname: { $regex: new RegExp(`^${subjectName}$`, "i") },
        });
        if (subject) {
          reply = `You were absent ${subject.absent || 0} day(s) in ${subject.Sname}.`;
        } else {
          reply = `I couldn’t find a subject named "${subjectName}".`;
        }
      } else {
        reply = "Please specify the subject, e.g 'absent in Physics'.";
      }
    }

    // Default fallback
    else {
      reply =
        " I can help you with:\n" +
        "• Your ongoing tasks\n" +
        "• Completed tasks\n" +
        "• Absence details for subjects\n" +
        "Try asking: 'What are my ongoing tasks?'";
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Chatbot encountered an internal error." });
  }
});

module.exports = router;
