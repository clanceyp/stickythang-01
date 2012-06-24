<?php

$dbConn = mysql_connect('localhost', 'stickyreader', '4ecQ3e!bl%DD8e');
if (!$dbConn) {
	die('Could not connect: ' . mysql_error());
} else {
	mysql_select_db("stickio");
}
// echo 'Connected successfully';
// mysql_close($dbConn);

?>