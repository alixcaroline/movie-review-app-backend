const nodemailer = require('nodemailer');

// generate otp , custum otp lenght possible, default 6
exports.generateOTP = (otp_length = 6) => {
	let OTP = '';
	for (let i = 1; i <= otp_length; i++) {
		const randomNumber = Math.round(Math.random() * 9);
		OTP += randomNumber;
	}
	return OTP;
};

// send otp to user
exports.generateMailTransporter = () =>
	nodemailer.createTransport({
		host: 'smtp.mailtrap.io',
		port: 2525,
		auth: {
			user: process.env.MAILTRAP_USER,
			pass: process.env.MAILTRAP_PASS,
		},
	});
