<?php

include_once "db.php";

$id = getValue("id");
$author = getValue("author");
$format = $_GET["format"];
$offset = (empty($_GET["offset"])) ? 0 : (int)$_GET["offset"] ;
$offsetEnd = $offset + 1000; 
$className =  getValue("c");
$said = "said";
$sql = "SELECT id, author, note, created, updated FROM sticky_notes WHERE state = 1 and (`id` = $id or `parent-id` = $id) order by created ASC limit $offset, $offsetEnd";
// $sql = "SELECT * FROM  `sticky_notes` LIMIT 0 , 30";
// echo $sql;
$rows = array();

if (!empty($id)){
	$result = mysql_query($sql);

	if ($format == "json"){
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
			$rows[] = $row;
		}
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
		header('Content-type: application/json');
		echo '{"'.$id.'":' . json_encode($rows) . '}';
	} else {
		$rs;
		while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
			$rs.= '<div id="rs'. $row["id"] .'" class="row" title="'. $row["created"] .'">
					<span class="user">'. $row["author"] .' '. $said .'...</span>
					<p>'. nl2br($row["note"]) .'</p>
				</div>';
			$said = "replied";
		}
		
		$html = '
			<!DOCTYPE html>
			<html lang="en">
			<head><title>single item</title>
				<link rel="stylesheet" media="screen" href="http://www.stickythang.com/lib/css/insert.css" />
			</head>
			<body class="'.$className.'">
				<div id="rs">'. $rs .'</div>
				<form method="POST" action="add.php">
					<input type="hidden" name="ops" value="{}"/>
					<input type="hidden" name="offset" value="'. $offset .'"/>
					<input type="hidden" name="parent-id" value="'. $id .'"/>
					<input type="hidden" name="author" value="'. $author .'"/>
					<input type="hidden" name="c" value="'. $className .'"/>
					<div style="position:relative;">
						<p style="margin-right:34px;">
							<input type="text" id="inputNote" name="note" value="" style="border-radius:6px;width:100%;height:22px;"/>
						</p>
						<input type="image" title="reply" alt="reply" style="position:absolute;right:0px;top:4px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEvUlEQVR4nHWVeWxUVRSHv3vfm860M3Rm2lIo0FIoS1vZSljELbGmQEQRUjYTE8AaEsRoEIgaCaAsxigE1EQT0BpJQE1qrBBEQ1iiKMoWKJZ9KyrQ1enCLO+9e/1jFq22v+QkJ+/cfPf3zj33PUEvWrR05ZCc7KxdpmnI3tb0pM7OrhudXfcWiEVLV+YDi9C6O0CIB9avXjG1j8+LUgqtNVonSwIpBUJIDCkQUiKlQArJ5zV7OPzjMa+ptX5z+bKqRSOKCrtxDxw+ipQSf2af1DOdJPcipRQAh76rzTHROsPjdhOJRAgGg6lFLpcLtMZxHCLRGGlpLpTj0Nzahoj7TriP54YhCQYDOErR1dkRMAGklEgpaWhooKCgAADbdgC4dPU669/eyjPzK5lQNoZVqzf06DY7K8jmjWtSrs1kwe/3EwqFqK+vp6hoGJZtAeDzehnQvx+5fbPRWpEVDPQIDvgz0Vr/HwyQn5/PqVOnOHeuDqU0IAgG/Kx97eXU4W1c8wpCCEAgBQghETJ+mJp/wKlJUEphWTYlpaU0NjbR0tyERnO64QKhcFcCrNAatIrnSoNGQ2LTaDTW3bHScahl29i2w6TJ93NqRzW7j+9nx/HtDIgMY9PcFygsHMwXNd+k3jDuPC6Px8OcWTNw/g12bAfLtrEsG9u2sR2HC6KR1lv7WDfvQV7d8CsHDh5hwbxKfjlxusceZwUDPF05M9HCJFglwHYc/Nb+apy+Z/mkcjtn7xzFn3uRUaXFRKNR5syakeivSE2TNCQZ6R5M0+jeCsdR2LZNzLJ4vfYDfFn1bJvxEeg0tOik4tE83r2wBXXGR25GIWX5xVQ9PBtvejqGYWCaBqZpIuA/PXYU0ViMl758h5HDbrOy/H3a7rXRHmkjzzeOJY9M5MVyD1IqHB1l1/GPqXivhhmFFcyfNI0MTwYedxoFBYO6g8NWlIWfrWHqJJslUzbT0HaJULgZKU0M2yRsGUhhYggDQ7qYW1bF/AlR9tZ9xczqpYxqGUrxgCFs2bSuO/jnG3X4/Nd4aPiTHLpWTWv4DwQChEBoic8dxO/OJdPTF0O7iEVMpDSYVvIUo1f059mttZRmDEVp1f3wpgwew9FbY9hx5FseG9cHbdgk6mgBbdZNWmNAhyDDFcBrZpPX5z4UGeR6S/lwmWZV9SHOXjrf/YJIIdhcuZxI41h2H2nG6zbJzfTQN9NDts9N0OsmyxcPj/seyrjFn+HvaYr+RLt1kfzAYJ6fOZDFO9fS2dERd2w79r7t1bsqEBjpWlMfznS/33nbvWR6PwZmezl5pZWDZzpwmYK0RCTzgLeVsUN/J8+fR8mAInLzLvLb1atorWTy6uQA3tS0PzFyccn4wJqq6TniVmOEPV8LPTq90LGFwlK2iGmLmHLoUhFx3bgjx5e4WFg+hOt3Q2zf2R77q+bE8ORHqDkRce29uO68b/TlbeG7n04sTjOvNbfUXtt7YCNwBYglWpiM9MOPj3iuKWS9UV6WLqxARyxsR0yjx/sJcK6xrn1Q1smGVjXbCsV+4HLLaeAOEE7Ao0AE6ORyy7Emny90s0NXtLc7bU5d485euSllpafhSxsBFJL8bfQsk3F5k/G6xgD+vwGPxiDDhwX8IQAAAABJRU5ErkJggg=="/>
					</div>
				</form>
				<script type="text/javascript">
					function setStart(){
						setSize();
						var objDiv = document.getElementById("rs");
						objDiv.scrollTop = objDiv.scrollHeight;
						window.t = setInterval(function(){
							if (document.activeElement == document.getElementById("inputNote")){
								// has focus user may be typing, so stop messing with the page
								// document.getElementById("inputNote").value = ( new Date() ).toLocaleTimeString();
								window.clearInterval(window.t);
							} else {
								window.location.reload();
							}
						},60*1000)
					}
					function setSize(){
						document.getElementById("rs").style.height = document.forms[0].offsetTop + "px";
					}
					
					window.addEventListener("load",setStart,false)
					window.addEventListener("resize",setSize,false)
					
					  var _gaq = _gaq || [];
					  _gaq.push([\'_setAccount\', \'UA-24752164-1\']);
					  _gaq.push([\'_trackPageview\']);
					
					  (function() {
					    var ga = document.createElement(\'script\'); ga.type = \'text/javascript\'; ga.async = true;
					    ga.src = (\'https:\' == document.location.protocol ? \'https://ssl\' : \'http://www\') + \'.google-analytics.com/ga.js\';
					    var s = document.getElementsByTagName(\'script\')[0]; s.parentNode.insertBefore(ga, s);
					  })();
					
				</script>
			</body>
			</html>';
		
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
		header('Content-type: text/html');
		echo $html;
	}

}

// echo 'Connected successfully';
// mysql_close($dbConn);
function getValue($key) {
	$value = $_GET[$key];
	if (empty($value)){
		$value = $_POST[$key];
	}
	return $value; 
} 


?>