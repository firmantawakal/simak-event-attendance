const express = require('express');
const EventsController = require('../controllers/eventsController');
const { validate, eventSchemas } = require('../utils/validation');

const router = express.Router();

// GET /api/events - Get all events
router.get('/', EventsController.getAllEvents);

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming', EventsController.getUpcomingEvents);

// GET /api/events/past - Get past events
router.get('/past', EventsController.getPastEvents);

// GET /api/events/slug/:slug - Get event by slug
router.get('/slug/:slug', EventsController.getEventBySlug);

// GET /api/events/stats - Get global system statistics
router.get('/stats', EventsController.getSystemStats);

// GET /api/events/:id - Get event by ID
router.get('/:id',
  validate(eventSchemas.id, 'params'),
  EventsController.getEventById
);

// POST /api/events - Create new event
router.post('/',
  validate(eventSchemas.create),
  EventsController.createEvent
);

// PUT /api/events/:id - Update event
router.put('/:id',
  [
    validate(eventSchemas.id, 'params'),
    validate(eventSchemas.update)
  ],
  EventsController.updateEvent
);

// DELETE /api/events/:id - Delete event
router.delete('/:id',
  validate(eventSchemas.id, 'params'),
  EventsController.deleteEvent
);

module.exports = router;