-- ─────────────────────────────────────────────────────────────────────────────
-- Initialisation de la base miss_tahiti
-- ─────────────────────────────────────────────────────────────────────────────

USE miss_tahiti;

-- ─── Table utilisateurs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id_user       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prenom        VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Table candidates ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
  id_candidate INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom          VARCHAR(100) NOT NULL,
  prenom       VARCHAR(100) NOT NULL,
  age          TINYINT UNSIGNED NOT NULL,
  taille       SMALLINT UNSIGNED NOT NULL COMMENT 'Taille en cm',
  photo_url    VARCHAR(500) NOT NULL,
  profession   VARCHAR(255) NULL,
  langues      VARCHAR(255) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Table votes ──────────────────────────────────────────────────────────────
-- Un seul enregistrement par utilisateur (UNIQUE sur id_user).
-- Chaque colonne *_candidate_id correspond à une catégorie.
-- Les FK empêchent la suppression d'une candidate déjà associée à un vote.
CREATE TABLE IF NOT EXISTS votes (
  id_vote                        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_user                        INT UNSIGNED NOT NULL UNIQUE,
  miss_tahiti_candidate_id       INT UNSIGNED NULL,
  premiere_dauphine_candidate_id INT UNSIGNED NULL,
  deuxieme_dauphine_candidate_id INT UNSIGNED NULL,
  miss_heiva_candidate_id        INT UNSIGNED NULL,
  created_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_vote_user
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,

  CONSTRAINT fk_vote_miss_tahiti
    FOREIGN KEY (miss_tahiti_candidate_id) REFERENCES candidates(id_candidate) ON DELETE RESTRICT,

  CONSTRAINT fk_vote_premiere_dauphine
    FOREIGN KEY (premiere_dauphine_candidate_id) REFERENCES candidates(id_candidate) ON DELETE RESTRICT,

  CONSTRAINT fk_vote_deuxieme_dauphine
    FOREIGN KEY (deuxieme_dauphine_candidate_id) REFERENCES candidates(id_candidate) ON DELETE RESTRICT,

  CONSTRAINT fk_vote_miss_heiva
    FOREIGN KEY (miss_heiva_candidate_id) REFERENCES candidates(id_candidate) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── Données initiales : 10 candidates Miss Tahiti 2026 ───────────────────────
INSERT INTO candidates (nom, prenom, age, taille, photo_url, profession, langues) VALUES
  ('MOLLIMARD',     'Orama',   30, 164, '/candidates/candidate-1.jpg',  'Auto-entrepreneure : Guide Culinaire',                               'Francais, Anglais'),
  ('IE',            'Keanavai', 20, 168, '/candidates/candidate-2.jpg', 'Etudiante BTS GPME - Miss Arue 2025',                               'Francais, Anglais'),
  ('DIARD',         'Leia',    22, 172, '/candidates/candidate-3.jpg',  'Enseignante de Ori Tahiti',                                         'Francais'),
  ('ALLAIN',        'Iriatai', 25, 175, '/candidates/candidate-4.jpg',  'Auto-entrepreneure dans la communication',                          'Francais, Anglais'),
  ('TAPI',          'Turama',  22, 179, '/candidates/candidate-5.jpg',  'Chargee de coordination administrative et gestion financiere',      'Francais, Anglais'),
  ('ARAPARI COWAN', 'Turama',  24, 176, '/candidates/candidate-6.jpg',  'Chargee de marketing et de communication',                         'Francais, Anglais'),
  ('CORNELOUP',     'Heiani',  25, 174, '/candidates/candidate-7.jpg',  'Auto-entrepreneure : Chargee de communication et Community Manager','Francais, Anglais'),
  ('UURU',          'Moevai',  23, 173, '/candidates/candidate-8.jpg',  'Sans profession',                                                   'Francais'),
  ('HURI',          'Heimiri', 21, 170, '/candidates/candidate-9.jpg',  'Personnel navigant commercial',                                     'Francais, Anglais'),
  ('LASSERRE',      'Vaheana', 19, 167, '/candidates/candidate-10.jpg', 'Etudiante en licence de Langues Etrangeres Appliquees',             'Francais, Anglais, notions d Espagnol');
