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
      ('Admin User', 'admin@simak.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqNNPNqIC5gDj5e', 'admin');
    `;

    // Create sample event if none exists
    const insertSampleEvent = `
      INSERT IGNORE INTO events (name, slug, description, date, location) VALUES
      ('Open Campus Day 2024', 'open-campus-day-2024', 'Annual open campus event for prospective students', '2024-12-15T09:00:00Z', 'Main Auditorium');
    `;

    // Execute all table creations
    await db.query(createEventsTable);
    console.log('✅ Events table created');

    await db.query(createAttendanceTable);
    console.log('✅ Attendance table created');

    await db.query(createUsersTable);
    console.log('✅ Users table created');

    await db.query(insertDefaultAdmin);
    console.log('✅ Default admin user created (email: admin@simak.com, password: admin123)');

    await db.query(insertSampleEvent);
    console.log('✅ Sample event created');

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