<?php
$conn = new mysqli("localhost", "root", "", "bloodbank");

$result = $conn->query("SELECT * FROM requests");

echo "<h2>All Blood Requests</h2>";

while ($row = $result->fetch_assoc()) {
    echo "User ID: " . $row['user_id'] . 
         " | Blood: " . $row['blood_group'] . 
         " | Type: " . $row['type'] . 
         " | Status: " . $row['status'] . "<br>";
}
?>