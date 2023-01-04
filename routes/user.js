const express = require('express');
const { check } = require('express-validator');
const {
	create,
	verifyEmail,
	resendEmailVerificationToken,
	forgetPassword,
	sendResetPasswordTokenStatus,
	resetPassword,
} = require('../controllers/user');
const {
	userValidator,
	validate,
	validatePassword,
} = require('../middlewares/validator');
const { isValidPasswordResetToken } = require('../middlewares/user');

const router = express.Router();

router.post('/create', userValidator, validate, create);

router.post('/verify-email', verifyEmail);

router.post('/resend-email-verification', resendEmailVerificationToken);

router.post('/forget-password', forgetPassword);

router.post(
	'/verify-password-reset-token',
	isValidPasswordResetToken,
	sendResetPasswordTokenStatus,
);

router.post(
	'/reset-password',
	validatePassword,
	validate,
	isValidPasswordResetToken,
	resetPassword,
);

module.exports = router;
