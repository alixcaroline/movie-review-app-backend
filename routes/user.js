const express = require('express');
const { check } = require('express-validator');
const { create } = require('../controllers/user');
const { userValidator, validate } = require('../middlewares/validator');

const router = express.Router();

router.post('/create', userValidator, validate, create);

module.exports = router;
