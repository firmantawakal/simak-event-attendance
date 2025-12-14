require('dotenv').config();
const db = require('./index');

const createInstitutionsTable = async () => {
  try {
    console.log('🔧 Creating institutions table...');

    // Create institutions table
    const createInstitutionsTable = `
      CREATE TABLE IF NOT EXISTS institutions (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        type ENUM('university', 'school', 'government', 'company', 'other') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Insert sample institutions if table is empty
    const insertSampleInstitutions = `
      INSERT IGNORE INTO institutions (name, type) VALUES
      ('Universitas Indonesia', 'university'),
      ('Universitas Gadjah Mada', 'university'),
      ('Institut Teknologi Bandung', 'university'),
      ('Universitas Diponegoro', 'university'),
      ('Universitas Airlangga', 'university'),
      ('Institut Pertanian Bogor', 'university'),
      ('Universitas Padjadjaran', 'university'),
      ('Universitas Hasanuddin', 'university'),
      ('Universitas Sriwijaya', 'university'),
      ('Universitas Sebelas Maret', 'university'),
      ('Universitas Muhammadiyah Yogyakarta', 'university'),
      ('Universitas Negeri Yogyakarta', 'university'),
      ('Universitas Sumatera Utara', 'university'),
      ('Universitas Negeri Malang', 'university'),
      ('Universitas Pendidikan Indonesia', 'university'),
      ('SMA Negeri 1 Jakarta', 'school'),
      ('SMA Negeri 2 Bandung', 'school'),
      ('Kementerian Pendidikan', 'government'),
      ('Kementerian Riset dan Teknologi', 'government'),
      ('Lainnya (Isi manual)', 'other');
    `;

    await db.query(createInstitutionsTable);
    console.log('✅ Institutions table created');

    await db.query(insertSampleInstitutions);
    console.log('✅ Sample institutions inserted');

    // Verify the table was created and has data
    const result = await db.query('SELECT COUNT(*) as count FROM institutions');
    console.log(`✅ Institutions table now has ${result[0].count} records`);

    console.log('🎉 Institutions table setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Institutions table setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  createInstitutionsTable();
}

module.exports = { createInstitutionsTable };