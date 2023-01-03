const User = require('../models/user');

exports.create = async (req, res) => {
	const { name, email, password } = req.body;

	//check if email exists already
	const duplicate = await User.findOne({ email });
	if (duplicate) {
		return res.status(401).json({ error: 'This email is already in use' });
	}
	const newUser = new User({ name, email, password });

	await newUser.save();

	res.status(201).json({ user: newUser });
};
