CREATE TABLE IF NOT EXISTS regions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conditions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    observed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT UNSIGNED NOT NULL,
    condition_id INT UNSIGNED NOT NULL,
    region_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id), 
    CONSTRAINT fk_condition FOREIGN KEY (condition_id) REFERENCES conditions(id), 
    CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES regions(id), 
    INDEX idx_reports_region_time (region_id, observed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO regions (id, name) VALUES 
    (1, 'South Bank'), 
    (2, 'Kangaroo Point'),
    (3, 'Toowong'),
    (4, 'Mount Coot-tha'),
    (5, 'Kenmore Hills'),
    (6, 'Mount Gravatt'),
    (7, 'Upper Mount Gravatt'),
    (8, 'Burbank'),
    (9, 'Wynnum'),
    (10, 'Enoggera'),
    (11, 'Nudgee'), 
    (12, 'Boondall'),
    (13, 'Shorncliffe'); 

INSERT INTO conditions (id, name, description) VALUES
    (1, 'Dry', 'No visible surface moisture'),
    (2, 'Damp', 'Surface is moist with little visible water'),
    (3, 'Wet', 'Visible water across the surface'),
    (4, 'Standing water', 'Puddles or accumulated water');