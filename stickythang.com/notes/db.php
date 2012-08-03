<?php

$dbHost = "stickio.db.9541835.hostedresource.com";
$dbUser = "stickio";
$dbPass = "A@88qleaiAAbl";
$dbName = "stickio";

$dbConn = mysql_connect($dbHost, $dbUser, $dbPass);
if (!$dbConn) {
	die('Could not connect: ' . mysql_error());
} else {
	mysql_select_db($dbName);
}
// echo 'Connected successfully';
// mysql_close($dbConn);

/*
-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Jul 01, 2012 at 09:09 PM
-- Server version: 5.1.61
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
*/

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*
--
-- Database: `stickio`
--

-- --------------------------------------------------------

--
-- Table structure for table `sticky_notes`
--

CREATE TABLE IF NOT EXISTS `sticky_notes` (
  `id` int(16) NOT NULL AUTO_INCREMENT,
  `parent-id` int(11) DEFAULT NULL,
  `replies` int(11) NOT NULL DEFAULT '0',
  `state` int(1) NOT NULL DEFAULT '1',
  `author` varchar(255) NOT NULL,
  `ops` text,
  `note` text,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=33 ;

--
-- Dumping data for table `sticky_notes`
--

INSERT INTO `sticky_notes` (`id`, `parent-id`, `replies`, `state`, `author`, `ops`, `note`, `created`, `updated`) VALUES
(31, NULL, 0, 1, 'tester', '{"domain":"www.bbc.co.uk","href":"http://www.bbc.co.uk/iplayer/","json":"{\\"className\\":\\"purple\\",\\"height\\":180,\\"left\\":63,\\"scope\\":\\"path\\",\\"state\\":\\"maximise\\",\\"position\\":\\"absolute\\",\\"top\\":207,\\"width\\":230}","id":"tester-1340470752996","html":"is the bbc page","path":"/iplayer/","querystring":"","scope":"path","shared":"true","user":"tester"}', 'is the bbc page', '2012-06-23 16:59:11', '2012-06-23 15:59:11'),
(32, NULL, 0, 1, 'tester', '{"domain":"www.direct.gov.uk","href":"http://www.direct.gov.uk/en/employment/employees/thenationalminimumwage/dg_10027201","json":"{\\"className\\":\\"yellow\\",\\"height\\":180,\\"left\\":664,\\"scope\\":\\"path\\",\\"state\\":\\"maximise\\",\\"shared\\":\\"true\\",\\"position\\":\\"absolute\\",\\"top\\":280,\\"width\\":230}","id":"tester-1340472771225","html":"minimum wage...","path":"/en/employment/employees/thenationalminimumwage/dg_10027201","querystring":"","scope":"path","shared":"true","user":"tester"}', 'minimum wage...', '2012-06-23 17:32:49', '2012-06-23 16:32:49');
*/

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

?>