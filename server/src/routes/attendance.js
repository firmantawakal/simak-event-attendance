const express = require('express');
const AttendanceController = require('../controllers/attendanceController');
const { validate, attendanceSchemas } = require('../utils/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting specifically for attendance submissions
const attendanceSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 attendance submissions per windowMs
  message: 'Too many attendance submissions, please try again later.'
});

// POST /api/attendance - Create new attendance record
router.post('/',
  attendanceSubmissionLimiter,
  validate(attendanceSchemas.create),
  AttendanceController.createAttendance
);

// GET /api/attendance/event/:eventId - Get attendance for specific event
router.get('/event/:eventId', AttendanceController.getEventAttendance);

// GET /api/attendance/event/:eventId/stats - Get attendance statistics for event
router.get('/event/:eventId/stats', AttendanceController.getEventAttendanceStats);

// GET /api/attendance/event/:eventId/export - Export attendance data
router.get('/event/:eventId/export', AttendanceController.exportEventAttendance);

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', AttendanceController.deleteAttendance);

// GET /api/attendance/search - Global attendance search
router.get('/search', AttendanceController.searchAttendance);

module.exports = router;