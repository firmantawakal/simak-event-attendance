const { pool, query } = require('../db');

class Attendance {
  // Create new attendance record
  static async create(attendanceData) {
    const {
      event_id,
      guest_name,
      institution,
      position = null,
      phone = null,
      email = null,
      representative_count = 1,
      category = 'guest'
    } = attendanceData;

    const sql = `
      INSERT INTO attendance (
        event_id, guest_name, institution, position, phone, email,
        representative_count, category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await pool.execute(sql, [
      event_id, guest_name, institution, position, phone, email,
      representative_count, category
    ]);

    return this.findById(result[0].insertId);
  }

  // Find attendance by ID
  static async findById(id) {
    const sql = `
      SELECT a.*, e.name as event_name, e.slug as event_slug
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      WHERE a.id = ?
    `;
    const attendance = await query(sql, [id]);
    return attendance[0] || null;
  }

  // Get attendance for specific event
  static async findByEventId(eventId, options = {}) {
    const {
      page = 1,
      pageSize = 20,
      institution,
      search
    } = options;

    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE a.event_id = ?';
    const params = [eventId];

    if (institution) {
      whereClause += ' AND a.institution = ?';
      params.push(institution);
    }

    if (search) {
      whereClause += ' AND (a.guest_name LIKE ? OR a.institution LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const sql = `
      SELECT
        a.*,
        e.name as event_name,
        e.slug as event_slug
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Simplified query without pagination for now
    const simpleSql = `
      SELECT
        a.*,
        e.name as event_name,
        e.slug as event_slug
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      WHERE a.event_id = ?
      ORDER BY a.created_at DESC
      LIMIT 50
    `;
    const attendance = await query(simpleSql, [eventId]);

    // Get total count for pagination
    const countSql = `
      SELECT COUNT(*) as total
      FROM attendance a
      ${whereClause}
    `;

    const countResult = await query(countSql, [eventId]);
    const total = countResult[0].total;

    return {
      attendance,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  // Get attendance statistics for an event
  static async getEventStats(eventId) {
    const sql = `
      SELECT
        COUNT(*) as total_attendees,
        COUNT(DISTINCT institution) as total_institutions,
        SUM(representative_count) as total_represented,
        AVG(representative_count) as avg_represented,
        MIN(arrival_time) as first_arrival,
        MAX(arrival_time) as last_arrival
      FROM attendance
      WHERE event_id = ?
    `;

    const stats = await query(sql, [eventId]);
    return stats;
  }

  // Get attendance by institution for an event
  static async getByInstitution(eventId) {
    const sql = `
      SELECT
        institution,
        COUNT(*) as attendee_count,
        SUM(representative_count) as total_represented,
        GROUP_CONCAT(guest_name ORDER BY guest_name) as guests
      FROM attendance
      WHERE event_id = ?
      GROUP BY institution
      ORDER BY institution
    `;

    return await query(sql, [eventId]);
  }

  // Get attendance by category for an event
  static async getByCategory(eventId) {
    const sql = `
      SELECT
        category,
        COUNT(*) as attendee_count,
        SUM(representative_count) as total_represented
      FROM attendance
      WHERE event_id = ?
      GROUP BY category
      ORDER BY attendee_count DESC
    `;

    return await query(sql, [eventId]);
  }

  // Check if guest already registered for event
  static async checkDuplicate(eventId, guestName, institution) {
    const sql = `
      SELECT COUNT(*) as count
      FROM attendance
      WHERE event_id = ? AND guest_name = ? AND institution = ?
    `;

    const result = await query(sql, [eventId, guestName, institution]);
    return result[0].count > 0;
  }

  // Delete attendance record
  static async delete(id) {
    const sql = 'DELETE FROM attendance WHERE id = ?';
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  // Export attendance data for event (CSV format)
  static async exportForEvent(eventId, options = {}) {
    const { institution, search } = options;

    let whereClause = 'WHERE a.event_id = ?';
    const params = [eventId];

    if (institution) {
      whereClause += ' AND a.institution = ?';
      params.push(institution);
    }

    if (search) {
      whereClause += ' AND (a.guest_name LIKE ? OR a.institution LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const sql = `
      SELECT
        a.guest_name,
        a.institution,
        a.position,
        a.phone,
        a.email,
        a.representative_count,
        a.category,
        a.arrival_time,
        e.name as event_name,
        e.date as event_date,
        e.location as event_location
      FROM attendance a
      JOIN events e ON a.event_id = e.id
      ${whereClause}
      ORDER BY a.arrival_time ASC
    `;

    const [result] = await pool.execute(sql, params);
    return result;
  }
}

module.exports = Attendance;