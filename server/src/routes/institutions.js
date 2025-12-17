const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all institutions
router.get('/', async (req, res) => {
  try {
    const institutions = await query(
      'SELECT * FROM institutions ORDER BY type, name'
    );
    res.json({
      success: true,
      institutions
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch institutions'
    });
  }
});

// Get institution by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const institutions = await query(
      'SELECT * FROM institutions WHERE id = ?',
      [id]
    );

    if (institutions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Institution not found'
      });
    }

    res.json({
      success: true,
      institution: institutions[0]
    });
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch institution'
    });
  }
});

// Add new institution (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can add institutions'
      });
    }

    const { name, type } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Name and type are required'
      });
    }

    if (!['university', 'school', 'government', 'company', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Invalid institution type'
      });
    }

    const result = await query(
      'INSERT INTO institutions (name, type) VALUES (?, ?)',
      [name, type]
    );

    res.status(201).json({
      success: true,
      message: 'Institution added successfully',
      institution: {
        id: result.insertId,
        name,
        type
      }
    });
  } catch (error) {
    console.error('Error adding institution:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        message: 'Institution with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to add institution'
    });
  }
});

// Update institution (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can update institutions'
      });
    }

    const { id } = req.params;
    const { name, type } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Name and type are required'
      });
    }

    if (!['university', 'school', 'government', 'company', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Invalid institution type'
      });
    }

    const result = await query(
      'UPDATE institutions SET name = ?, type = ? WHERE id = ?',
      [name, type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Institution not found'
      });
    }

    res.json({
      success: true,
      message: 'Institution updated successfully',
      institution: {
        id,
        name,
        type
      }
    });
  } catch (error) {
    console.error('Error updating institution:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        message: 'Institution with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update institution'
    });
  }
});

// Delete institution (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can delete institutions'
      });
    }

    const { id } = req.params;

    // Check if institution is being used in attendance records
    // First get the institution name, then check attendance records
    const institutionResult = await query(
      'SELECT name FROM institutions WHERE id = ?',
      [id]
    );

    if (institutionResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Institution not found'
      });
    }

    const institutionName = institutionResult[0].name;
    const attendanceRecords = await query(
      'SELECT COUNT(*) as count FROM attendance WHERE institution = ?',
      [institutionName]
    );

    if (attendanceRecords[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Cannot delete institution that is being used in attendance records'
      });
    }

    const result = await query(
      'DELETE FROM institutions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Institution not found'
      });
    }

    res.json({
      success: true,
      message: 'Institution deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete institution'
    });
  }
});

module.exports = router;