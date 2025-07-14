const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const User = require('../models/User');
const Content = require('../models/Content');
const Follow = require('../models/Follow');

// Use the student ID directly in routes
const studentId = 'MOO804091';
const baseRoute = `/${studentId}`;

  module.exports = router;