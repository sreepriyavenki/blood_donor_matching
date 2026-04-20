require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blood_donor_db"
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Connected to MySQL");
  }
});

/* ── SMS HELPER ────────────────────────────────────────────────────── */

async function sendSMS(phoneNumber, message) {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: phoneNumber
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("SMS sent successfully:", response.data);
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error.response?.data || error.message);
    return false;
  }
}

/* ── SIGNUP ────────────────────────────────────────────────────────── */

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  const sql = "INSERT INTO users(email,password) VALUES(?,?)";

  db.query(sql, [email, password], (err, result) => {
    if (err) {
      res.send("Signup Failed");
    } else {
      res.send("Signup Successful");
    }
  });
});

/* ── LOGIN ─────────────────────────────────────────────────────────── */

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email=? AND password=?";

  db.query(sql, [email, password], (err, result) => {
    if (result.length > 0) {
      res.send("Login Successful");
    } else {
      res.send("Invalid Email or Password");
    }
  });
});

/* ── REGISTER DONOR ────────────────────────────────────────────────── */

app.post("/register", (req, res) => {
  const { name, email, phone, blood_group, district, city, area, health_status, last_donation_date, availability } = req.body;

  const sql = `
    INSERT INTO donors
    (name,email,phone,blood_group,district,city,area,health_status,last_donation_date,availability)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(sql, [name, email, phone, blood_group, district, city, area, health_status, last_donation_date, availability], (err, result) => {
    if (err) {
      console.error("Registration error:", err);
      res.send("Registration Failed");
    } else {
      res.send("Donor Registered Successfully");
    }
  });
});

/* ── SEARCH DONOR ──────────────────────────────────────────────────── */

app.post("/search", (req, res) => {
  const { blood_group, district } = req.body;
  const sql = "SELECT name,blood_group,city,phone FROM donors WHERE blood_group=? AND district=? AND availability='Yes'";

  db.query(sql, [blood_group, district], (err, result) => {
    if (err) {
      res.json([]);
    } else {
      res.json(result);
    }
  });
});

/* ── DIRECT REQUEST (User to Specific Donor) ───────────────────────── */

app.post("/request_direct", async (req, res) => {
  const { donorPhone, userName, userContact, hospital } = req.body;

  const message =
    `URGENT BLOOD REQUEST: Help needed! ` +
    `Patient/User: ${userName}. Contact: ${userContact}. ` +
    `Hospital: ${hospital}. Please reach out if you can donate blood. - Blood Donor System`;

  const smsSent = await sendSMS(donorPhone, message);

  if (smsSent) {
    res.send("Message sent to the donor successfully!");
  } else {
    res.send("Failed to send message to the donor.");
  }
});

/* ── BLOOD REQUEST (SMS to matching donors) ────────────────────────── */

app.post("/request", async (req, res) => {
  const { patient_name, blood_group, district, city, hospital, contact } = req.body;

  const insertSql = `
    INSERT INTO blood_requests
    (patient_name,blood_group,district,city,hospital,contact,status)
    VALUES (?,?,?,?,?,?,'pending')
  `;

  db.query(insertSql, [patient_name, blood_group, district, city, hospital, contact], async (err, result) => {
    if (err) {
      return res.send("Request Failed");
    }

    /* Find all available donors with matching blood group in the same district */
    const donorSql = `
      SELECT phone, name FROM donors
      WHERE blood_group=? AND district=? AND availability='Yes'
    `;

    db.query(donorSql, [blood_group, district], async (err2, donors) => {
      if (err2 || donors.length === 0) {
        return res.send("Blood Request Sent (No matching donors found to notify)");
      }

      /* Send SMS to each matching donor */
      const message =
        `URGENT: A patient needs ${blood_group} blood at ${hospital}, ${city}. ` +
        `Patient: ${patient_name}. Contact: ${contact}. ` +
        `Please check the Blood Donor System and accept if available. - Blood Donor System`;

      const phoneNumbers = donors.map(d => d.phone).join(",");
      const smsSent = await sendSMS(phoneNumbers, message);

      if (smsSent) {
        res.send(`Blood Request Sent & ${donors.length} donor(s) notified via SMS!`);
      } else {
        res.send("Blood Request Sent (SMS notification failed)");
      }
    });
  });
});

/* ── NOTIFICATIONS ─────────────────────────────────────────────────── */

app.post("/notifications", (req, res) => {
  const { district } = req.body;
  const sql = "SELECT * FROM blood_requests WHERE district=? AND status='pending'";

  db.query(sql, [district], (err, result) => {
    if (err) {
      res.json([]);
    } else {
      res.json(result);
    }
  });
});

/* ── ACCEPT REQUEST ─────────────────────────────────────────────────── */

app.post("/accept", (req, res) => {
  const { id } = req.body;

  const sql = "UPDATE blood_requests SET status='accepted' WHERE id=?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      res.send("Error");
    } else {
      res.send("Request Accepted");
    }
  });
});

/* ── START SERVER ──────────────────────────────────────────────────── */

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});