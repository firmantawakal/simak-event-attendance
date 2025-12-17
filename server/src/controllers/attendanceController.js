const Event = require('../models/Event');
const Attendance = require('../models/Attendance');

class AttendanceController {
  // POST /api/attendance - Create new attendance record
  static async createAttendance(req, res, next) {
    try {
      const { eventSlug, ...attendanceData } = req.body;

      // Log the received data for debugging
      console.log('Received attendance data:', { eventSlug, attendanceData });

      // Find event by slug
      const event = await Event.findBySlug(eventSlug);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with slug '${eventSlug}' not found`
        });
      }

      // Check for duplicate registration
      const isDuplicate = await Attendance.checkDuplicate(
        event.id,
        attendanceData.guestName,
        attendanceData.institution
      );

      if (isDuplicate) {
        return res.status(409).json({
          error: 'Duplicate registration',
          message: 'This person has already registered for this event'
        });
      }

      // Prepare data for attendance creation
      const attendanceRecordData = {
        event_id: event.id,
        guest_name: attendanceData.guestName,
        institution: attendanceData.institution,
        position: attendanceData.position || null,
        phone: attendanceData.phone || null,
        email: attendanceData.email || null,
        representative_count: attendanceData.representativeCount || 1,
        category: attendanceData.category || 'guest'
      };

      console.log('Attendance record data:', attendanceRecordData);

      // Create attendance record
      const attendance = await Attendance.create(attendanceRecordData);

      // Emit real-time update to all clients viewing this event
      const io = req.app.get('io');
      if (io) {
        io.to(`event-${event.id}`).emit('new-attendance', {
          id: attendance.id,
          guest_name: attendance.guest_name,
          institution: attendance.institution,
          position: attendance.position,
          category: attendance.category,
          arrival_time: attendance.arrival_time,
          event_name: event.name,
          event_slug: event.slug
        });
      }

      res.status(201).json({
        message: 'Attendance recorded successfully',
        attendance: {
          ...attendance,
          event_name: event.name,
          event_slug: event.slug
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/attendance/event/:eventId - Get attendance for event
  static async getEventAttendance(req, res, next) {
    try {
      const { eventId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 20,
        institution: req.query.institution,
        search: req.query.search
      };

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${eventId} not found`
        });
      }

      const result = await Attendance.findByEventId(eventId, options);

      res.json({
        event: {
          id: event.id,
          name: event.name,
          slug: event.slug,
          date: event.date,
          location: event.location
        },
        attendance: result.attendance,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/attendance/event/:eventId/stats - Get attendance statistics
  static async getEventAttendanceStats(req, res, next) {
    try {
      const { eventId } = req.params;

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${eventId} not found`
        });
      }

      const [stats, byInstitution, byCategory] = await Promise.all([
        Attendance.getEventStats(eventId),
        Attendance.getByInstitution(eventId),
        Attendance.getByCategory(eventId)
      ]);

      res.json({
        event: {
          id: event.id,
          name: event.name,
          slug: event.slug,
          date: event.date,
          location: event.location
        },
        stats,
        byInstitution,
        byCategory
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/attendance/event/:eventId/export - Export attendance data
  static async exportEventAttendance(req, res, next) {
    try {
      const { eventId } = req.params;
      const format = req.query.format || 'csv';
      const options = {
        institution: req.query.institution,
        search: req.query.search
      };

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${eventId} not found`
        });
      }

      if (format !== 'csv') {
        return res.status(400).json({
          error: 'Unsupported format',
          message: 'Only CSV export is currently supported'
        });
      }

      const attendanceData = await Attendance.exportForEvent(eventId, options);

      // Generate CSV content
      const csvHeaders = [
        'Guest Name',
        'Institution',
        'Position',
        'Phone',
        'Email',
        'Representative Count',
        'Category',
        'Arrival Time',
        'Event Name',
        'Event Date',
        'Event Location'
      ];

      const csvRows = attendanceData.map(row => [
        row.guest_name || '',
        row.institution || '',
        row.position || '',
        row.phone || '',
        row.email || '',
        row.representative_count || 1,
        row.category || 'guest',
        row.arrival_time || '',
        row.event_name || '',
        row.event_date || '',
        row.event_location || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Set response headers for CSV download
      const filename = `attendance-${event.slug}-${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/attendance/:id - Delete attendance record
  static async deleteAttendance(req, res, next) {
    try {
      const { id } = req.params;

      // Check if attendance record exists
      const attendance = await Attendance.findById(id);
      if (!attendance) {
        return res.status(404).json({
          error: 'Attendance record not found',
          message: `Attendance record with ID ${id} not found`
        });
      }

      await Attendance.delete(id);

      res.json({
        message: 'Attendance record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/attendance/search - Global attendance search
  static async searchAttendance(req, res, next) {
    try {
      const {
        query,
        page = 1,
        pageSize = 20,
        eventId,
        institution,
        category,
        startDate,
        endDate
      } = req.query;

      let sql = `
        SELECT
          a.*,
          e.name as event_name,
          e.slug as event_slug,
          e.date as event_date
        FROM attendance a
        JOIN events e ON a.event_id = e.id
        WHERE 1=1
      `;

      const params = [];

      if (query) {
        sql += ' AND (a.guest_name LIKE ? OR a.institution LIKE ?)';
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm);
      }

      if (eventId) {
        sql += ' AND a.event_id = ?';
        params.push(eventId);
      }

      if (institution) {
        sql += ' AND a.institution = ?';
        params.push(institution);
      }

      if (category) {
        sql += ' AND a.category = ?';
        params.push(category);
      }

      if (startDate) {
        sql += ' AND a.arrival_time >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND a.arrival_time <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY a.arrival_time DESC';

      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      const results = await db.query(sql, params);

      // Get total count
      const countSql = sql.replace('SELECT a.*, e.name as event_name, e.slug as event_slug, e.date as event_date', 'SELECT COUNT(*) as total')
        .replace('ORDER BY a.arrival_time DESC LIMIT ? OFFSET ?', '');

      const [countResult] = await db.query(countSql, params.slice(0, -2));
      const total = countResult.total;

      res.json({
        attendance: results,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceController;