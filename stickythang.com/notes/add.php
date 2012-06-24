<?php

include_once "db.php";

$author = mysql_real_escape_string($_POST["author"]);
$ops = mysql_real_escape_string($_POST["ops"]);
$note = mysql_real_escape_string(trim($_POST["note"]));
$offset = (empty($_POST["offset"])) ? 0 : (int)$_POST["offset"] ;
$c = $_POST["c"];
$offsetEnd = $offset + 1000; 
$rs;
$parentId = 0;
$host  = $_SERVER['HTTP_HOST'];
$uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
$uri.= '/one.php';
$action = "no action taken";
if (empty($author) || empty($ops) || empty($note)){
	echo "<html><head><title>error</title></head><body>missing required attributes</body></html>";
	exit;
}else if (!empty($_POST["parent-id"])){
	$parentId = (int)$_POST["parent-id"];
	$sql = "INSERT INTO `sticky_notes` ( `author`, `note`, `parent-id`, `created`) VALUES ('". $author ."','". $note."',". $parentId.",now())";
	$result = mysql_query($sql);
	$sql = "UPDATE `sticky_notes` set `replies` = `replies` + 1 where `id` = " .$parentId.";";
	$result = mysql_query($sql);
	$action = "parent item updated";
	//header("Location: http://$host$uri?id=$parentId&author=$author&c=$c");
	//echo "<html><head><title>error</title></head><body>Location: http://$host$uri?id=$parentId&author=$author&c=$c</body></html>";
	//exit;
} else {
	$sql = "INSERT INTO `sticky_notes` ( `author`, `ops`, `note`, `created`) VALUES ('". $author ."','". $ops."','". $note."',now())";
	$result = mysql_query($sql);
	$parentId = mysql_insert_id();
	$action = "new item added";
	//header("Location: http://$host$uri?id=$parentId&author=$author&c=$c");
	//echo "<html><head><title>error</title></head><body>Location: Location: http://$host$uri?id=$parentId&author=$author&c=$c</body></html>";
	//exit;
	}

header("Location: http://$host$uri?id=$parentId&author=$author&c=$c");
exit;

//echo $sql;
/*
 
$sql = "SELECT id, author, note, created, updated FROM sticky_notes WHERE state = 1 and (`id` = $parentId or `parent-id` = $parentId) order by created ASC limit $offset, $offsetEnd";

$result = mysql_query($sql);

while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
	$rs.= '<div id="rs'. $row["id"] .'" class="row" title="created '. $row["created"] .'">
			<span>'. $row["author"] .'</span>
			<p>'. nl2br($row["note"]) .'</p>
		</div>';
}

$html = '
	<!DOCTYPE html>
	<html lang="en">
	<head><title>single item</title>
		<link rel="stylesheet" media="screen" href="http://www.stickythang.com/css/insert.css" />
	</head>
	<body>
		'. $rs .'
		<form method="POST" action="add.php">
			<input type="hidden" name="offset" value="'. $offset .'"/>
			<input type="hidden" name="parent-id" value="'. $parentId .'"/>
			<input type="hidden" name="author" value="'. $author .'"/>
			<p><textarea name="note"></textarea></p>
			<p><input type="submit" value="and then..."/></p>
		</form>
	</body>
	</html>';

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: text/html');
echo $html;

*/


?>