SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+03:00";
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';


CREATE TABLE `sample` (
	`id` int(255) NOT NULL,
	`name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
