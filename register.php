<?php
$conn = new mysqli("localhost", "root", "", "bloodbank");

$name = $_POST['name'];
$email = $_POST['email'];
$password = $_POST['password'];

$sql = "INSERT INTO users (name, email, password, role) 
        VALUES ('$name', '$email', '$password', 'user')";

$conn->query($sql);

echo "Registered Successfully!";
?>