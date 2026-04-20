<?php
$conn = new mysqli("localhost", "root", "", "bloodbank");

$user_id = $_POST['user_id'];
$blood_group = $_POST['blood_group'];
$type = $_POST['type']; // donate or request

$sql = "INSERT INTO requests (user_id, blood_group, type, status) 
        VALUES ('$user_id', '$blood_group', '$type', 'pending')";

$conn->query($sql);

echo "Request Submitted!";
?>