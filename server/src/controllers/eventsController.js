const Event = require('../models/Event');
const Attendance = require('../models/Attendance');

class EventsController {
  // GET /api/events - Get all events
  static async getAllEvents(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const offset = (page - 1) * pageSize;

      const [events, total] = await Promise.all([
        Event.findAll(pageSize, offset),
        Event.count()
      ]);

      res.json({
        events,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/upcoming - Get upcoming events
  static async getUpcomingEvents(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const events = await Event.findUpcoming(limit);
      res.json({ events });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/past - Get past events
  static async getPastEvents(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const events = await Event.findPast(limit);
      res.json({ events });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/:id - Get event by ID
  static async getEventById(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findWithStats(id);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${id} not found`
        });
      }

      res.json({ event });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/events - Create new event
  static async createEvent(req, res, next) {
    try {
      const eventData = req.body;

      // Check if slug already exists
      const existingEvent = await Event.findBySlug(eventData.slug);
      if (existingEvent) {
        return res.status(409).json({
          error: 'Slug sudah ada',
          message: 'Acara dengan slug ini sudah ada. Silakan pilih slug yang berbeda.'
        });
      }

      const event = await Event.create(eventData);
      res.status(201).json({
        message: 'Acara berhasil dibuat',
        event
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/events/:id - Update event
  static async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const eventData = req.body;

      // Check if event exists
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${id} not found`
        });
      }

      // If slug is being updated, check if it's already taken
      if (eventData.slug && eventData.slug !== existingEvent.slug) {
        const slugExists = await Event.findBySlug(eventData.slug);
        if (slugExists) {
          return res.status(409).json({
            error: 'Slug already exists',
            message: 'An event with this slug already exists. Please choose a different slug.'
          });
        }
      }

      const event = await Event.update(id, eventData);
      res.json({
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/events/:id - Delete event
  static async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;

      // Check if event exists
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with ID ${id} not found`
        });
      }

      await Event.delete(id);
      res.json({
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/slug/:slug - Get event by slug (for attendance form)
  static async getEventBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const event = await Event.findBySlug(slug);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
          message: `Event with slug '${slug}' not found`
        });
      }

      res.json({ event });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/stats - Get global system statistics
  static async getSystemStats(req, res, next) {
    try {
      // Get all events count
      const totalEvents = await Event.count();

      // Get global attendance statistics using a single efficient query
      const { pool } = require('../db');

      const [attendanceStats] = await pool.execute(`
        SELECT
          COUNT(*) as total_attendees,
          COUNT(DISTINCT institution) as total_institutions,
          SUM(representative_count) as total_represented,
          AVG(representative_count) as avg_represented,
          MIN(arrival_time) as first_arrival,
          MAX(arrival_time) as last_arrival
        FROM attendance
      `);

      const [recentActivity] = await pool.execute(`
        SELECT
          COUNT(*) as recent_attendees,
          COUNT(DISTINCT institution) as recent_institutions
        FROM attendance
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `);

      const stats = {
        totalEvents,
        totalAttendees: attendanceStats[0]?.total_attendees || 0,
        totalInstitutions: attendanceStats[0]?.total_institutions || 0,
        totalRepresented: attendanceStats[0]?.total_represented || 0,
        avgRepresented: parseFloat(attendanceStats[0]?.avg_represented || 0).toFixed(1),
        firstArrival: attendanceStats[0]?.first_arrival,
        lastArrival: attendanceStats[0]?.last_arrival,
        recentActivity: {
          attendeesThisWeek: recentActivity[0]?.recent_attendees || 0,
          institutionsThisWeek: recentActivity[0]?.recent_institutions || 0
        }
      };

      res.json({ stats });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      next(error);
    }
  }
}

module.exports = EventsController;