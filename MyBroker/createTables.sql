-- ****************** SqlDBM: MySQL ******************;
-- ***************************************************;


-- ************************************** `profile`

CREATE TABLE `profile`
(
 `profilename` varchar(45) NOT NULL ,
 `risk`        varchar(45) NOT NULL ,
PRIMARY KEY (`profilename`)
);






-- ************************************** `ticker`

CREATE TABLE `ticker`
(
 `symbol`      varchar(45) NOT NULL ,
 `target`      decimal NOT NULL ,
 `exchange`    varchar(45) NOT NULL ,
 `profilename` varchar(45) NOT NULL ,
PRIMARY KEY (`symbol`, `exchange`, `profilename`),
KEY `fkIdx_27` (`profilename`),
CONSTRAINT `FK_27` FOREIGN KEY `fkIdx_27` (`profilename`) REFERENCES `profile` (`profilename`)
);


-- ************************************** `user`

CREATE TABLE `user`
(
 `username`     varchar(45) NOT NULL ,
 `firstname`    varchar(45) NOT NULL ,
 `lastname`     varchar45) NOT NULL ,
 `salt`         varchar(45) NOT NULL ,
 `hash`         varchar(45) NOT NULL ,
 `email`        varchar(45) NOT NULL ,
 `status`       varchar(45) NOT NULL ,
 `type`         varchar(45) NOT NULL ,
 `creationdate` datetime NOT NULL ,
PRIMARY KEY (`username`)
);






-- ************************************** `account`

CREATE TABLE `account`
(
 `username`      varchar(45) NOT NULL DEFAULT UNIQUE ,
 `accountid`     integer NOT NULL DEFAULT UNIQUE ,
 `profilename`   varchar(45) NOT NULL ,
 `symbol`        varchar(45) NOT NULL ,
 `exchange`      varchar(45) NOT NULL ,
 `units`         int ,
 `cash`          decimal ,
 `profilename_1` varchar(45) NOT NULL ,
PRIMARY KEY (`username`, `accountid`),
KEY `fkIdx_32` (`username`),
CONSTRAINT `FK_32` FOREIGN KEY `fkIdx_32` (`username`) REFERENCES `user` (`username`),
KEY `fkIdx_36` (`profilename_1`),
CONSTRAINT `FK_36` FOREIGN KEY `fkIdx_36` (`profilename_1`) REFERENCES `profile` (`profilename`),
KEY `fkIdx_43` (`symbol`, `exchange`, `profilename`),
CONSTRAINT `FK_43` FOREIGN KEY `fkIdx_43` (`symbol`, `exchange`, `profilename`) REFERENCES `ticker` (`symbol`, `exchange`, `profilename`)
);


-- ************************************** `transactionlog`

CREATE TABLE `transactionlog`
(
 `transactionid`  NOT NULL DEFAULT UNIQUE ,
 `username`      varchar(45) NOT NULL ,
 `accountid`     integer NOT NULL ,
 `date`          datetime NOT NULL ,
 `type`          varchar(45) NOT NULL ,
 `description`   multilinestring NOT NULL ,
 `accountbefore` json NOT NULL ,
 `accountafter`  json NOT NULL ,
PRIMARY KEY (`transactionid`, `username`, `accountid`),
KEY `fkIdx_53` (`username`, `accountid`),
CONSTRAINT `FK_53` FOREIGN KEY `fkIdx_53` (`username`, `accountid`) REFERENCES `account` (`username`, `accountid`)
);

