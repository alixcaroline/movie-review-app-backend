const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isVerified: {
		type: Boolean,
		required: true,
		default: false,
	},
	role: {
		type: String,
		required: true,
		default: 'user',
		enum: ['admin', 'user'],
	},
});

//hash password before saving user
UserSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

UserSchema.methods.comparePassword = async function (password) {
	const result = bcrypt.compare(password, this.password);
	return result;
};

module.exports = mongoose.model('User', UserSchema);
