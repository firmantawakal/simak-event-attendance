const Event = require('../models/Event');

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
          error: 'Slug already exists',
          message: 'An event with this slug already exists. Please choose a different slug.'
        });
      }

      const event = await Event.create(eventData);
      res.status(201).json({
        message: 'Event created successfully',
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
}

module.exports = EventsController;