const db = require('../db');

class Event {
  // Create new event
  static async create(eventData) {
    const { name, slug, description, date, location } = eventData;

    const sql = `
      INSERT INTO events (name, slug, description, date, location)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      // For INSERT operations, we need the full result object to get insertId
      const connection = db.pool;
      const [result] = await connection.execute(sql, [name, slug, description, date, location]);
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Find event by ID
  static async findById(id) {
    const sql = 'SELECT * FROM events WHERE id = ?';
    const events = await db.query(sql, [id]);
    return events[0] || null;
  }

  // Find event by slug
  static async findBySlug(slug) {
    const sql = 'SELECT * FROM events WHERE slug = ?';
    const events = await db.query(sql, [slug]);
    return events[0] || null;
  }

  // Get all events
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM events
      ORDER BY date DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    return await db.query(sql);
  }

  // Count total events
  static async count() {
    const sql = 'SELECT COUNT(*) as total FROM events';
    const result = await db.query(sql);
    return result[0]?.total || 0;
  }

  // Update event
  static async update(id, eventData) {
    const { name, slug, description, date, location } = eventData;

    // Build dynamic UPDATE query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (slug !== undefined) {
      updateFields.push('slug = ?');
      updateValues.push(slug);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (date !== undefined) {
      updateFields.push('date = ?');
      updateValues.push(date);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }

    // Always include updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const sql = `
      UPDATE events
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const result = await db.query(sql, updateValues);
    return result.affectedRows > 0 ? this.findById(id) : null;
  }

  // Delete event
  static async delete(id) {
    const sql = 'DELETE FROM events WHERE id = ?';
    const result = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Get event with attendance count
  static async findWithStats(id) {
    const sql = `
      SELECT
        e.*,
        COUNT(a.id) as total_attendees,
        COUNT(DISTINCT a.institution) as total_institutions,
        SUM(a.representative_count) as total_represented
      FROM events e
      LEFT JOIN attendance a ON e.id = a.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;

    const events = await db.query(sql, [id]);
    return events[0] || null;
  }

  // Get upcoming events
  static async findUpcoming(limit = 10) {
    const sql = `
      SELECT * FROM events
      WHERE date >= NOW()
      ORDER BY date ASC
      LIMIT ${parseInt(limit)}
    `;
    return await db.query(sql);
  }

  // Get past events
  static async findPast(limit = 10) {
    const sql = `
      SELECT * FROM events
      WHERE date < NOW()
      ORDER BY date DESC
      LIMIT ${parseInt(limit)}
    `;
    return await db.query(sql);
  }
}

module.exports = Event;