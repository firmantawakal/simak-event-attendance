require('dotenv').config();
const db = require('./index');

const createTables = async () => {
  try {
    console.log('🔧 Setting up database tables...');

    // Create events table
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        date DATETIME NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create attendance table
    const createAttendanceTable = `
      CREATE TABLE IF NOT EXISTS attendance (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        event_id BIGINT NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        representative_count INT DEFAULT 1,
        category VARCHAR(50) DEFAULT 'guest',
        arrival_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        INDEX idx_event_id (event_id),
        INDEX idx_institution (institution),
        INDEX idx_arrival_time (arrival_time),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create users table (for admin authentication)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'superadmin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Insert default admin user (password: admin123)
    const insertDefaultAdmin = `
      INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
      ('Admin Universitas Dumai', 'admin@universitasdumai.ac.id', '$2a$12$oq8.IwcjirPesnLg/UVRleyHo5G3viG0V6v2SryuS.EcKV6jukRV2', 'admin');
    `;

    // Create sample events if none exists
    const insertSampleEvents = `
      INSERT IGNORE INTO events (name, slug, description, date, location) VALUES
      ('Open Campus Day 2024', 'open-campus-day-2024', 'Acara tahunan open campus untuk calon mahasiswa baru. Kunjungi kampus kami dan temukan program studi yang sesuai dengan minat Anda.', '2024-12-15T09:00:00Z', 'Auditorium Utama Universitas Dumai'),
      ('Seminar Nasional Teknologi', 'seminar-nasional-teknologi-2024', 'Seminar nasional dengan tema "Transformasi Digital di Era Industri 4.0" yang akan menghadirkan pembicara dari berbagai perusahaan teknologi terkemuka.', '2024-12-20T13:00:00Z', 'Gedung Rektorat Lantai 3'),
      ('Workshop Kewirausahaan Mahasiswa', 'workshop-kewirausahaan-mahasiswa-2024', 'Workshop intensif untuk mahasiswa yang ingin memulai bisnis startup. Materi meliputi business model canvas, pitching, dan funding.', '2025-01-10T08:30:00Z', 'Laboratorium Komputer Lantai 2'),
      ('Job Fair Universitas Dumai 2024', 'job-fair-universitas-dumai-2024', 'Pameran lowongan kerja tahunan dengan lebih dari 50 perusahaan ternama yang akan merekrut karyawan dari berbagai jurusan.', '2025-01-15T09:00:00Z', 'Lapangan Olahraga Universitas Dumai'),
      ('Lokakarya Penelitian Ilmiah', 'lokakarya-penelitian-ilmiah-2024', 'Lokakarya metodologi penelitian ilmiah untuk mahasiswa S1 dan S2 dengan fokus pada publikasi jurnal internasional.', '2025-01-22T10:00:00Z', 'Perpustakaan Pusat Ruang Seminar'),
      ('Festival Seni dan Budaya', 'festival-seni-budaya-2024', 'Pameran seni dan pertunjukan budaya dari mahasiswa berbagai program studi yang menampilkan kekayaan seni nusantara.', '2025-02-05T16:00:00Z', 'Halaman Kampus Utama'),
      ('Seminar Kesehatan Mental', 'seminar-kesehatan-mental-2024', 'Seminar penting tentang kesehatan mental bagi mahasiswa dengan narasumber dari psikolog profesional dan konselor kampus.', '2025-02-10T13:30:00Z', 'Auditorium Kedokteran Lantai 1'),
      ('Competitive Programming Bootcamp', 'competitive-programming-bootcamp-2024', 'Bootcamp intensif programming kompetitif untuk persiapan mengikuti kompetisi programming tingkat nasional dan internasional.', '2025-02-18T09:00:00Z', 'Lab. Sistem Informasi Lantai 3');
    `;

    // Execute all table creations
    await db.query(createEventsTable);
    console.log('✅ Events table created');

    await db.query(createAttendanceTable);
    console.log('✅ Attendance table created');

    await db.query(createUsersTable);
    console.log('✅ Users table created');

    await db.query(insertDefaultAdmin);
    console.log('✅ Default admin user created (email: admin@universitasdumai.ac.id, password: admin123)');

    await db.query(insertSampleEvents);
    console.log('✅ Sample events created');

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('✅ Setup completed. You can now start the server.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };