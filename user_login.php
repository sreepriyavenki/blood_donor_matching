<?php
$conn = new mysqli("localhost", "root", "", "bloodbank");

$email = $_POST['email'];
$password = $_POST['password'];

$result = $conn->query("SELECT * FROM users WHERE email='$email' AND password='$password'");

if ($result->num_rows > 0) {
    echo "User Login Success";
} else {
    echo "Invalid Login";
}
?>