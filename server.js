const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
host:"localhost",
user:"root",
password:"",
database:"blood_donor_db"
});

db.connect(err=>{
if(err){
console.log("Database connection failed");
}else{
console.log("Connected to MySQL");
}
});

/* SIGNUP */

app.post("/signup",(req,res)=>{

const {email,password}=req.body;

const sql="INSERT INTO users(email,password) VALUES(?,?)";

db.query(sql,[email,password],(err,result)=>{
if(err){
res.send("Signup Failed");
}else{
res.send("Signup Successful");
}
});

});

/* LOGIN */

app.post("/login",(req,res)=>{

const {email,password}=req.body;

const sql="SELECT * FROM users WHERE email=? AND password=?";

db.query(sql,[email,password],(err,result)=>{

if(result.length>0){
res.send("Login Successful");
}else{
res.send("Invalid Email or Password");
}

});

});

/* REGISTER DONOR */

app.post("/register",(req,res)=>{

const {name,email,blood_group,district,city,area,health_status,last_donation_date,availability}=req.body;

const sql=`
INSERT INTO donors
(name,email,blood_group,district,city,area,health_status,last_donation_date,availability)
VALUES (?,?,?,?,?,?,?,?,?)
`;

db.query(sql,[name,email,blood_group,district,city,area,health_status,last_donation_date,availability],
(err,result)=>{

if(err){
res.send("Registration Failed");
}else{
res.send("Donor Registered Successfully");
}

});

});

/* SEARCH DONOR */

app.post("/search",(req,res)=>{

const {blood_group,district}=req.body;

const sql="SELECT name,blood_group,city FROM donors WHERE blood_group=? AND district=?";

db.query(sql,[blood_group,district],(err,result)=>{

if(err){
res.json([]);
}else{
res.json(result);
}

});

});

/* BLOOD REQUEST */

app.post("/request",(req,res)=>{

const {patient_name,blood_group,district,city,hospital,contact}=req.body;

const sql=`
INSERT INTO blood_requests
(patient_name,blood_group,district,city,hospital,contact,status)
VALUES (?,?,?,?,?,?, 'pending')
`;

db.query(sql,[patient_name,blood_group,district,city,hospital,contact],(err,result)=>{

if(err){
res.send("Request Failed");
}else{
res.send("Blood Request Sent");
}

});

});

/* SHOW NOTIFICATIONS */

app.post("/notifications",(req,res)=>{

const {district}=req.body;

const sql="SELECT * FROM blood_requests WHERE district=? AND status='pending'";

db.query(sql,[district],(err,result)=>{

if(err){
res.json([]);
}else{
res.json(result);
}

});

});

/* ACCEPT REQUEST */

app.post("/accept",(req,res)=>{

const {id}=req.body;

const sql="UPDATE blood_requests SET status='accepted' WHERE id=?";

db.query(sql,[id],(err,result)=>{

if(err){
res.send("Error");
}else{
res.send("Request Accepted");
}

});

});

app.listen(5000,()=>{
console.log("Server running on http://localhost:5000");
});