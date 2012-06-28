<?php

include_once "db.php";

$array = explode(",",mysql_real_escape_string( $_POST["authors"] ));
if (count($array) > 1){
	$authors = "'" . implode("','", $array) . "'";
} else {
	$authors = "'" . mysql_real_escape_string( $_POST["authors"] ) . "'";
}
// $authors = "'" + implode("','", $array) + "'";
$offset = (empty($_POST["offset"])) ? 0 : (int)$_POST["offset"] ;
$offsetEnd = $offset + 100;
// $from = $_POST["from"];
$mil = (int)$_POST["from"];
$seconds = $mil / 1000;
$from = date("Y-m-d H:i:s", $seconds);

if (!empty($_GET["users"]) && $_GET["users"] == "all"){
	$authors = "value";
	$sql = "SELECT id, author, note, ops, updated FROM `sticky_notes` WHERE `parent-id` is null and state = 1 LIMIT 0 , 300";
} else if (!empty($_GET["users"])){
	//$authors = $_GET["users"];
	$authors = "";	
	$sql = "SELECT id, author, note, ops, updated FROM `sticky_notes` WHERE `parent-id` is null and state = 1 and author in ($authors) limit $offset, $offsetEnd";
} else {
	$sql = "SELECT id, author, note, ops, updated FROM `sticky_notes` WHERE `parent-id` is null and state = 1 and updated >= '". $from ."' and author in ($authors) limit $offset, $offsetEnd";
}

// echo $sql;
// die();
$rows = array();

if (!empty($authors)){
	$result = mysql_query($sql);
	while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
		$rows[] = $row;
	}
}



header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
 echo '{"notes":' . json_encode($rows) . ',"sql":'. json_encode($sql)  .'}';
//echo '{"notes":' . json_encode($rows) . '}';


// echo 'Connected successfully';
// mysql_close($dbConn);


?>