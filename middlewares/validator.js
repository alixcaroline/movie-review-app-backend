const { check, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const genres = require('../utils/genres');

exports.signInValidator = [
	check('email').normalizeEmail().isEmail().withMessage('Email is invalid'),
	check('password').trim().not().isEmpty().withMessage('Password is missing'),
];

exports.userValidator = [
	check('name').trim().not().isEmpty().withMessage('Name is missing'),
	check('email').normalizeEmail().isEmail().withMessage('Email is invalid'),
	check('password')
		.trim()
		.isLength({ min: 8, max: 20 })
		.withMessage('password must be 8 to 20 characters long'),
];

exports.validatePassword = [
	check('newPassword')
		.trim()
		.isLength({ min: 8, max: 20 })
		.withMessage('password must be 8 to 20 characters long'),
];

exports.validate = (req, res, next) => {
	const error = validationResult(req).array();
	if (error.length) {
		return res.json({ error: error[0].msg });
	}
	next();
};

exports.actorInfoValidator = [
	check('name').trim().not().isEmpty().withMessage('Name is missing'),

	check('about')
		.trim()
		.not()
		.isEmpty()
		.withMessage('About is a required field'),
	check('gender')
		.trim()
		.not()
		.isEmpty()
		.withMessage('Gender is a required field'),
];

exports.validateMovie = [
	check('title').trim().not().isEmpty().withMessage('Title is missing!'),
	check('storyLine')
		.trim()
		.not()
		.isEmpty()
		.withMessage('Storyline is important!'),
	check('language').trim().not().isEmpty().withMessage('Language is missing!'),
	check('status')
		.isIn(['public', 'private'])
		.withMessage('status must be public or private!'),
	check('releaseDate').isDate().withMessage('Release date is missing!'),
	check('genres')
		.isArray()
		.withMessage('Genres must be an array of strings!')
		.custom((value) => {
			for (let g of value) {
				if (!genres.includes(g)) throw Error('Invalid genres!');
			}
			return true;
		}),
	check('tags')
		.isArray({ min: 1 })
		.withMessage('Tags must be an array of strings!')
		.custom((tags) => {
			for (let tag of tags) {
				if (typeof tag !== 'string')
					throw Error('Tags must be an array of strings');
			}
			return true;
		}),
	check('cast')
		.isArray()
		.withMessage('cast must be an array of objects!')
		.custom((cast) => {
			for (let c of cast) {
				if (!isValidObjectId(c.actor))
					throw Error('Invalid cast actor inside cast!');
				if (!c.roleAs?.trim()) throw Error('Role as is missing inside cast!');
				if (typeof c.leadActor !== 'boolean')
					throw Error(
						'Only accepted boolean value inside leadActor inside cast',
					);
			}
			return true;
		}),

	// check('poster').custom((_, { req }) => {
	// 	if (!req.file) throw Error('Poster file is missing!');
	// 	return true;
	// }),
];

exports.validateTrailer = check('trailer')
	.isObject()
	.withMessage('Trailer must be an object with url and public_id')
	.custom(({ url, public_id }) => {
		try {
			const result = new URL(url);

			if (!result.protocol.includes('http')) {
				throw Error('Trailer url is invalid!');
			}

			//public id is in cloudinary url after last / and before .mp4 us array to extract id
			const arr = url.split('/');
			const publicId = arr[arr.length - 1].split('.')[0];
			if (publicId !== public_id) {
				throw Error('Trailer public_id is invalid');
			}
		} catch (err) {
			throw Error('Trailer url is invalid!');
		}
		return true;
	});

exports.validateRatings = check(
	'rating',
	'Rating must be a number between 0 and 10',
).isFloat({ min: 0, max: 10 });
