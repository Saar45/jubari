-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Apr 10, 2025 at 03:25 AM
-- Server version: 8.0.35
-- PHP Version: 8.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jubari`
--

-- --------------------------------------------------------

--
-- Table structure for table `conge`
--

CREATE TABLE `conge` (
  `idConge` tinyint NOT NULL AUTO_INCREMENT,
  `descriptionDemande` text,
  `dateEffectiveVoulue` date DEFAULT NULL,
  `dateRetourVoulue` date DEFAULT NULL,
  `paye_O_N` tinyint DEFAULT NULL,
  `AvisChefDirect` tinyint DEFAULT NULL,
  `DatePriseDecisionChefDirect` date DEFAULT NULL,
  `AvisChefRh` tinyint DEFAULT NULL,
  `DatePriseDecisionRh` date DEFAULT NULL,
  `MotifRefus` varchar(191) DEFAULT NULL,
  `nomSignataireChefService` varchar(7) DEFAULT NULL,
  `prenomSignataireChefService` varchar(9) DEFAULT NULL,
  `nomSignataireRh` varchar(11) DEFAULT NULL,
  `prenomSignataireRh` varchar(5) DEFAULT NULL,
  `idHistoriqueConge` tinyint DEFAULT NULL,
  `idEmploye` tinyint NOT NULL,
  PRIMARY KEY (`idConge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `conge`
--
DELIMITER $$
CREATE TRIGGER `ajoutidhistorique_avant_insertion_conge` BEFORE INSERT ON `conge` FOR EACH ROW BEGIN
    DECLARE newHistoriqueId TINYINT;

    -- Insert a new record into historique_conges
    INSERT INTO historique_conges (dateDemandeConge, etatConge, idEmploye)
    VALUES (CURRENT_DATE, 'En attente', NEW.idEmploye);

    -- Get the last inserted id for historique_conges
    SET newHistoriqueId = LAST_INSERT_ID();

    -- Assign the new id to idHistoriqueConge in conge
    SET NEW.idHistoriqueConge = newHistoriqueId;
END
$$
DELIMITER ;

-- Remove the redundant after insert trigger
DROP TRIGGER IF EXISTS `conge_after_insert`;

DELIMITER $$
CREATE TRIGGER `delete_conge` AFTER DELETE ON `conge` FOR EACH ROW BEGIN
   
    DELETE FROM historique_conges WHERE idHistoriqueConge = OLD.idHistoriqueConge;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `employe`
--

CREATE TABLE `employe` (
  `idEmploye` tinyint NOT NULL AUTO_INCREMENT,
  `nomEmploye` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prenomEmploye` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `adresseEmploye` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `villeEmploye` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codePostaleEmploye` mediumint DEFAULT NULL,
  `salaireDeBaseEmploye` decimal(6,2) DEFAULT NULL,
  `role` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `heuresSup` tinyint DEFAULT NULL,
  `emailEmploye` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `motdepasse` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idService` tinyint DEFAULT NULL,
  `idService_Dirige` tinyint DEFAULT NULL,
  `nb_conges_payes` int DEFAULT '25',
  PRIMARY KEY (`idEmploye`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `employe`
--
DELIMITER $$
CREATE TRIGGER `before_employe_delete` BEFORE DELETE ON `employe` FOR EACH ROW BEGIN
    IF EXISTS (SELECT 1 FROM conge WHERE idEmploye = OLD.idEmploye) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Impossible de supprimer un employé avec un record de congés.';
    END IF;
    IF EXISTS (SELECT 1 FROM message WHERE idEmploye = OLD.idEmploye) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Impossible de supprimer un employé avec des tickets de messages existants.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `historique_conges`
--

CREATE TABLE `historique_conges` (
  `idHistoriqueConge` tinyint NOT NULL AUTO_INCREMENT,
  `dateDemandeConge` date DEFAULT NULL,
  `datePriseDeDecision` date DEFAULT NULL,
  `etatConge` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEmploye` tinyint DEFAULT NULL,
  PRIMARY KEY (`idHistoriqueConge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `idTicketReclamation` tinyint NOT NULL AUTO_INCREMENT,
  `dateReclamation` date DEFAULT NULL,
  `descriptionReclamation` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEmploye` tinyint DEFAULT NULL,
  PRIMARY KEY (`idTicketReclamation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service`
--

CREATE TABLE `service` (
  `idService` tinyint NOT NULL AUTO_INCREMENT,
  `nomService` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idEmploye` tinyint DEFAULT NULL,
  PRIMARY KEY (`idService`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create views before data insertion
DROP VIEW IF EXISTS v_conge;
CREATE VIEW v_conge AS 
SELECT 
    c.idConge AS id,
    c.descriptionDemande AS description,
    c.dateEffectiveVoulue AS date_effective,
    c.dateRetourVoulue AS date_retour,
    c.paye_O_N AS paye,
    c.AvisChefDirect AS avis_chef_direct,
    c.DatePriseDecisionChefDirect AS date_decision_chef_direct,
    c.AvisChefRh AS avis_chef_rh,
    c.DatePriseDecisionRh AS date_decision_rh,
    c.MotifRefus AS motif_refus,
    c.nomSignataireChefService AS nom_signataire_chef,
    c.prenomSignataireChefService AS prenom_signataire_chef,
    c.nomSignataireRh AS nom_signataire_rh,
    c.prenomSignataireRh AS prenom_signataire_rh,
    c.idHistoriqueConge AS historique_conge_id,
    c.idEmploye AS employe_id
FROM conge c;

DROP VIEW IF EXISTS v_employe;
CREATE VIEW v_employe AS 
SELECT 
    e.idEmploye AS id,
    e.nomEmploye AS nom,
    e.prenomEmploye AS prenom,
    e.adresseEmploye AS adresse,
    e.villeEmploye AS ville,
    e.codePostaleEmploye AS code_postal,
    e.salaireDeBaseEmploye AS salaire_base,
    e.role,
    e.heuresSup AS heures_supplementaires,
    e.emailEmploye AS email,
    e.motdepasse AS password,
    e.idService AS service_id,
    e.idService_Dirige AS dirige_service_id,
    e.nb_conges_payes
FROM employe e;

DROP VIEW IF EXISTS v_historique_conges;
CREATE VIEW v_historique_conges AS 
SELECT 
    h.idHistoriqueConge AS id,
    h.dateDemandeConge AS date_demande,
    h.datePriseDeDecision AS date_decision,
    h.etatConge AS etat,
    h.idEmploye AS employe_id
FROM historique_conges h;

DROP VIEW IF EXISTS v_message;
CREATE VIEW v_message AS 
SELECT 
    m.idTicketReclamation AS id,
    m.dateReclamation AS date_reclamation,
    m.descriptionReclamation AS description,
    m.idEmploye AS employe_id
FROM message m;

DROP VIEW IF EXISTS v_service;
CREATE VIEW v_service AS 
SELECT 
    s.idService AS id,
    s.nomService AS nom,
    s.idEmploye AS employe_id
FROM service s;

-- Clear existing data in correct order (respect foreign keys)
TRUNCATE TABLE conge;
TRUNCATE TABLE historique_conges;
TRUNCATE TABLE message;
TRUNCATE TABLE employe;
TRUNCATE TABLE service;

-- Reset auto-increment counters
ALTER TABLE message AUTO_INCREMENT = 1;
ALTER TABLE conge AUTO_INCREMENT = 1;
ALTER TABLE historique_conges AUTO_INCREMENT = 1;
ALTER TABLE employe AUTO_INCREMENT = 1;
ALTER TABLE service AUTO_INCREMENT = 1;

-- 1. First create services (without chiefs for now)
INSERT INTO service (nomService) VALUES
('Ressources Humaines'),
('Technologie de l''information'),
('Ingénierie Mécanique'),
('Production'),
('Qualité'),
('Ventes'),
('Marketing'),
('Recherche et Développement'),
('Logistique'),
('Service Client');

-- 2. Then insert employees
INSERT INTO employe (nomEmploye, prenomEmploye, emailEmploye, motdepasse, role, idService) VALUES
-- Service 1: Ressources Humaines (id: 1)
('Smith', 'John', 'john.smith@jubari.com', '$2y$10$P0tvqpB5B6n7CElnotAVvOjSFPJ63C0Pl5FU36S1x0QNWvZb5PmdS', 'Directeur RH', 1),
('Johnson', 'Emma', 'emma.johnson@jubari.com', '$2y$10$A8lN1MpFEwYjVEIpLJ3I2u/2V/iPOIGY3eJ7eZc0N.ziPdxoM5GPS', 'Assistant RH', 1),
('Davis', 'Michael', 'michael.davis@jubari.com', '$2y$10$FrSFtHZkD.m8QOw0SdZkR.mz/We4Q5d5PJD5OBuh6hKklBHESaMY6',
 'Coordinateur RH', 1),

-- Service 2: Technologie de l'Information (id: 2)
('Wilson', 'Sarah', 'sarah.wilson@jubari.com', '$2y$10$vnye1jnOxDZzw2tuJYWEmOFGwHZ8rjbTJmJIEyLw.WVDvXfXiGo36',
 'Directeur Informatique', 2),
('Brown', 'David', 'david.brown@jubari.com', '$2y$10$u0GwMkNwaQaO2CNBkUvsD.hwhlEseNc4MIcnI5QsDMOEVscMUYB.K',
 'Administrateur Système', 2),
('Miller', 'Alice', 'alice.miller@jubari.com', '$2y$10$wu8zXcTCNs4/Hq8kZjTem.0TC.WiS/7lLhR8wCzPOEJ0MJKE0EVG2',
 'Développeur', 2),

-- Service 3: Ingénierie Mécanique (id: 3)
('Anderson', 'James', 'james.anderson@jubari.com', '$2y$10$q7GHYjbA7Y5atRm0tHdbz.oEIqGTuYgIKYESujXK2kze4oRgsRYTW',
 'Directeur Ingénierie', 3),
('Taylor', 'Robert', 'robert.taylor@jubari.com', '$2y$10$ObqYDYc1MGSzBpcCGDjMf.2/YHFONa8eWLBmwM0xSITorm9Z2SDdW',
 'Ingénieur Senior', 3),
('Thomas', 'Lisa', 'lisa.thomas@jubari.com', '$2y$10$ff8wVFGYYC73bxbRfxLe2OOfD.sX.QUNDIooNzlOHnLDtpi5TLw0.',
 'Ingénieur', 3),

-- Service 4: Production (id: 4)
('White', 'George', 'george.white@jubari.com', '$2y$10$d9NcODuUYssOWFgQsmIg/.DnnDBXrHqTZEWi.Fl3yUBG7h2rxKPEC',
 'Directeur de Production', 4),
('Harris', 'Patricia', 'patricia.harris@jubari.com', '$2y$10$eD62JRss7x9AfMZufAf0aeyqyJPbI/Sl0S.OnCHDoBUkP7t5C0eVG',
 'Superviseur de Production', 4),

-- Service 5: Qualité (id: 5)
('Clark', 'Daniel', 'daniel.clark@jubari.com', '$2y$10$e9fxGC.egCdI9nhEZIfc3eJt/FfIseQqvN7clfU5yr0EpB29K1epW',
 'Directeur Qualité', 5),
('Lewis', 'Jennifer', 'jennifer.lewis@jubari.com', '$2y$10$e6hMn.RfqTKmIcODX8J.2.gGEQSwVSYDmvHGpkAmDb1xH3PeYW9Ka',
 'Inspecteur Qualité', 5),
('Walker', 'Kevin', 'kevin.walker@jubari.com', '$2y$10$vgz/prwNsbsgSnadZarC1OW/4AlaqvN034zdtrb8JezvMSBPxb8kG',
 'Analyste Qualité', 5),

-- Service 6: Ventes (id: 6)
('Hall', 'Christopher', 'christopher.hall@jubari.com', '$2y$10$UfnAhAA5UzfRm4tSeuwKZeyQXGtR75SXj9kOshlATl7fchaOv7lue',
 'Directeur Commercial', 6),
('Young', 'Michelle', 'michelle.young@jubari.com', '$2y$10$UZSYW6POPbwe5mS8pA/BkOneBnGPFaikiqhK0Me6yGInUW5Xx9Vt.',
 'Commercial', 6),

-- Service 7: Marketing (id: 7)
('King', 'Richard', 'richard.king@jubari.com', '$2y$10$.UawvuV4/NTYKzU5L6OxFeD66Fg.n9/mV9HjdKsWN11OA3UjDiR9q',
 'Directeur Marketing', 7),
('Wright', 'Susan', 'susan.wright@jubari.com', '$2y$10$74x4Uo7q7BAE5h9YOOSuFOhr3KHPCCGfyhYuK9waa/lNJBc019Gu.',
 'Spécialiste Marketing', 7),
('Lopez', 'Maria', 'maria.lopez@jubari.com', '$2y$10$uvUOKzThVqeTtGJLVj4oYecou.fY4fOuLYVuw0Fh47Ap3uZa8Oz/6',
 'Coordinateur Marketing', 7),

-- Service 8: Recherche et Développement (id: 8)
('Green', 'William', 'william.green@jubari.com', '$2y$10$VyczOmq5tqA/AlABHymN7eA1eqjQTUkifVxAMNSxaX4CGjT9KF/6G',
 'Directeur R&D', 8),
('Adams', 'Elizabeth', 'elizabeth.adams@jubari.com', '$2y$10$cgnzG4rWUPihYiDEx3DtEuhLEp2nivA4WpD9rEPhM9bh4Yi38LVMK',
 'Chercheur', 8),

-- Service 9: Logistique (id: 9)
('Baker', 'Charles', 'charles.baker@jubari.com', '$2y$10$ObMSV5YzpWun//A3X/bKWeH1YItl2tRKpBxnIQQElosgzG72Rf6cm',
 'Directeur Logistique', 9),
('Hill', 'Margaret', 'margaret.hill@jubari.com', '$2y$10$26ueMEzeKP3N6FFU23sL6u3L.T5V9bBtEjnw1BFv2RpFm1RnWEOsW',
 'Coordinateur Logistique', 9),
('Scott', 'Thomas', 'thomas.scott@jubari.com', '$2y$10$AKbB1/On0g1fi9C336g4XOdT8LEFoZe0aatx0ugSoZXbZSsJMLQqC',
 'Spécialiste Expédition', 9),

-- Service 10: Service Client (id: 10)
('Nelson', 'Barbara', 'barbara.nelson@jubari.com', '$2y$10$aBZ1fy4Vok6cS2QjlTiIV.CTuNRvNURtOWTYCLO22hW8s6/smsAga',
 'Directeur Service Client', 10),
('Carter', 'Joseph', 'joseph.carter@jubari.com', '$2y$10$r58LkHS7sgbJZPoVkZBEEewEVIUzjsWNq9i1xVFBrCzOLJtbkQFNO',
 'Support Client', 10);

-- 3. Then update services with their chiefs
UPDATE service SET idEmploye = 1 WHERE idService = 1;  -- RH
UPDATE service SET idEmploye = 4 WHERE idService = 2;  -- IT
UPDATE service SET idEmploye = 7 WHERE idService = 3;  -- Engineering
UPDATE service SET idEmploye = 10 WHERE idService = 4; -- Production
UPDATE service SET idEmploye = 12 WHERE idService = 5; -- Quality
UPDATE service SET idEmploye = 15 WHERE idService = 6; -- Sales
UPDATE service SET idEmploye = 17 WHERE idService = 7; -- Marketing
UPDATE service SET idEmploye = 20 WHERE idService = 8; -- R&D
UPDATE service SET idEmploye = 22 WHERE idService = 9; -- Logistics
UPDATE service SET idEmploye = 25 WHERE idService = 10; -- Customer Service

-- 4. Update employees who are service chiefs
UPDATE employe SET idService_Dirige = idService 
WHERE idEmploye IN (1, 4, 7, 10, 12, 15, 17, 20, 22, 25);

-- 5. Finally insert conge records
INSERT INTO conge (descriptionDemande, dateEffectiveVoulue, dateRetourVoulue, paye_O_N, idEmploye) VALUES
-- RH Department leaves
('Congé annuel pour vacances d''été avec la famille', '2025-07-15', '2025-07-30', 1, 2),
('Rendez-vous médical important', '2025-05-20', '2025-05-22', 1, 3),

-- IT Department leaves
('Formation technique à Paris', '2025-06-01', '2025-06-05', 1, 5),
('Congé parental', '2025-08-01', '2025-08-15', 1, 6),

-- Engineering Department leaves
('Participation à une conférence internationale', '2025-09-10', '2025-09-15', 1, 8),
('Congé pour déménagement', '2025-05-25', '2025-05-28', 1, 9),

-- Production Department leaves
('Congé annuel planifié', '2025-07-01', '2025-07-10', 1, 11),

-- Quality Department leaves
('Formation sur les nouvelles normes ISO', '2025-06-15', '2025-06-18', 1, 13),
('Congé familial urgent', '2025-05-15', '2025-05-17', 1, 14),

-- Sales Department leaves
('Congé pour mariage', '2025-08-20', '2025-09-05', 1, 16);

-- --------------------------------------------------------

--
-- Structure for view `v_conge`
--
DROP TABLE IF EXISTS `v_conge`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_conge`  AS SELECT `conge`.`idConge` AS `id`, `conge`.`descriptionDemande` AS `description`, `conge`.`dateEffectiveVoulue` AS `date_effective`, `conge`.`dateRetourVoulue` AS `date_retour`, `conge`.`paye_O_N` AS `paye`, `conge`.`AvisChefDirect` AS `avis_chef_direct`, `conge`.`DatePriseDecisionChefDirect` AS `date_decision_chef_direct`, `conge`.`AvisChefRh` AS `avis_chef_rh`, `conge`.`DatePriseDecisionRh` AS `date_decision_rh`, `conge`.`MotifRefus` AS `motif_refus`, `conge`.`nomSignataireChefService` AS `nom_signataire_chef`, `conge`.`prenomSignataireChefService` AS `prenom_signataire_chef`, `conge`.`nomSignataireRh` AS `nom_signataire_rh`, `conge`.`prenomSignataireRh` AS `prenom_signataire_rh`, `conge`.`idHistoriqueConge` AS `historique_conge_id`, `conge`.`idEmploye` AS `employe_id` FROM `conge` ;

-- --------------------------------------------------------

--
-- Structure for view `v_employe`
--
DROP TABLE IF EXISTS `v_employe`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_employe`  AS SELECT `employe`.`idEmploye` AS `id`, `employe`.`nomEmploye` AS `nom`, `employe`.`prenomEmploye` AS `prenom`, `employe`.`adresseEmploye` AS `adresse`, `employe`.`villeEmploye` AS `ville`, `employe`.`codePostaleEmploye` AS `code_postal`, `employe`.`salaireDeBaseEmploye` AS `salaire_base`, `employe`.`role` AS `role`, `employe`.`heuresSup` AS `heures_supplementaires`, `employe`.`emailEmploye` AS `email`, `employe`.`motdepasse` AS `password`, `employe`.`idService` AS `service_id`, `employe`.`idService_Dirige` AS `dirige_service_id`, `employe`.`nb_conges_payes` AS `nb_conges_payes` FROM `employe` ;

-- --------------------------------------------------------

--
-- Structure for view `v_historique_conges`
--
DROP TABLE IF EXISTS `v_historique_conges`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_historique_conges`  AS SELECT `historique_conges`.`idHistoriqueConge` AS `id`, `historique_conges`.`dateDemandeConge` AS `date_demande`, `historique_conges`.`datePriseDeDecision` AS `date_decision`, `historique_conges`.`etatConge` AS `etat`, `historique_conges`.`idEmploye` AS `employe_id` FROM `historique_conges` ;

-- --------------------------------------------------------

--
-- Structure for view `v_message`
--
DROP TABLE IF EXISTS `v_message`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_message`  AS SELECT `message`.`idTicketReclamation` AS `id`, `message`.`dateReclamation` AS `date_reclamation`, `message`.`descriptionReclamation` AS `description`, `message`.`idEmploye` AS `employe_id` FROM `message` ;

-- --------------------------------------------------------

--
-- Structure for view `v_service`
--
DROP TABLE IF EXISTS `v_service`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_service`  AS SELECT `service`.`idService` AS `id`, `service`.`nomService` AS `nom`, `service`.`idEmploye` AS `employe_id` FROM `service` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conge`
--
ALTER TABLE `conge`
  ADD PRIMARY KEY (`idConge`),
  ADD KEY `conge_ibfk_1` (`idHistoriqueConge`),
  ADD KEY `conge_ibfk_2` (`idEmploye`);

--
-- Indexes for table `employe`
--
ALTER TABLE `employe`
  ADD PRIMARY KEY (`idEmploye`),
  ADD KEY `employe_ibfk_1` (`idService`),
  ADD KEY `employe_ibfk_2` (`idService_Dirige`);

--
-- Indexes for table `historique_conges`
--
ALTER TABLE `historique_conges`
  ADD PRIMARY KEY (`idHistoriqueConge`),
  ADD KEY `historique_conges_ibfk_1` (`idEmploye`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`idTicketReclamation`),
  ADD KEY `message_ibfk_1` (`idEmploye`);

--
-- Indexes for table `service`
--
ALTER TABLE `service`
  ADD PRIMARY KEY (`idService`),
  ADD KEY `fk1_chef` (`idEmploye`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `conge`
--
ALTER TABLE `conge`
  MODIFY `idConge` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `employe`
--
ALTER TABLE `employe`
  MODIFY `idEmploye` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `historique_conges`
--
ALTER TABLE `historique_conges`
  MODIFY `idHistoriqueConge` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `idTicketReclamation` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `service`
--
ALTER TABLE `service`
  MODIFY `idService` tinyint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `conge`
--
ALTER TABLE `conge`
  ADD CONSTRAINT `conge_ibfk_1` FOREIGN KEY (`idHistoriqueConge`) REFERENCES `historique_conges` (`idHistoriqueConge`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `conge_ibfk_2` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`idEmploye`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `employe`
--
ALTER TABLE `employe`
  ADD CONSTRAINT `employe_ibfk_1` FOREIGN KEY (`idService`) REFERENCES `service` (`idService`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `employe_ibfk_2` FOREIGN KEY (`idService_Dirige`) REFERENCES `service` (`idService`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `historique_conges`
--
ALTER TABLE `historique_conges`
  ADD CONSTRAINT `historique_conges_ibfk_1` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`idEmploye`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`idEmploye`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `service`
--
ALTER TABLE `service`
  ADD CONSTRAINT `fk1_chef` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`idEmploye`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
