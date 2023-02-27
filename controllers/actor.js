const { isValidObjectId } = require('mongoose');
const Actor = require('../models/actor');
const cloudinary = require('../cloud');
const {
	sendError,
	uploadImageToCloud,
	formatActor,
} = require('../utils/helper');

exports.createActor = async (req, res) => {
	const { name, about, gender } = req.body;
	const { file } = req;

	const newActor = new Actor({ name, about, gender });

	if (file) {
		const { url, public_id } = await uploadImageToCloud(file.path);
		newActor.avatar = { url, public_id };
	}

	await newActor.save();
	res.status(201).json({ actor: formatActor(newActor) });
};

exports.updateActor = async (req, res) => {
	const { name, about, gender } = req.body;
	const { file } = req;
	const { id } = req.params;

	if (!isValidObjectId(id)) return sendError(res, 'Invalid request!');
	const actor = await Actor.findById(id);
	if (!actor) return sendError(res, 'Invalid request, record not found!');

	//remove previous image file when uploading a new one
	const public_id = actor.avatar?.public_id;
	if (public_id && file) {
		const { result } = await cloudinary.uploader.destroy(public_id);
		if (result !== 'ok')
			return sendError(res, 'Could not remove image from cloud');
	}

	//upload file when there is a new image
	if (file) {
		const { url, public_id } = await uploadImageToCloud(file.path);
		actor.avatar = { url, public_id };
	}

	actor.name = name;
	actor.about = about;
	actor.gender = gender;

	await actor.save();

	res.status(201).json(formatActor(actor));
};

exports.removeActor = async (req, res) => {
	const { id } = req.params;

	if (!isValidObjectId(id)) return sendError(res, 'Invalid request!');
	const actor = await Actor.findById(id);
	if (!actor) return sendError(res, 'Invalid request, record not found!');

	//delete image from cloudinary
	const public_id = actor.avatar.public_id;
	if (public_id) {
		const { result } = await cloudinary.uploader.destroy(public_id);
		if (result !== 'ok')
			return sendError(res, 'Could not remove image from cloud');
	}

	await Actor.findByIdAndDelete(id);

	res.json({ message: 'Record removed successfully.' });
};

exports.searchActor = async (req, res) => {
	const { query } = req;
	const result = await Actor.find({ $text: { $search: `"${query.name}"` } });

	const actors = result.map((actor) => formatActor(actor));

	res.json({ results: actors });
};

exports.getLatestActors = async (req, res) => {
	const result = await Actor.find().sort({ createdAt: '-1' }).limit(12);

	const actors = result.map((actor) => formatActor(actor));

	res.json(actors);
};

exports.getSingleActor = async (req, res) => {
	const { id } = req.params;

	if (!isValidObjectId(id)) return sendError(res, 'Invalid request!');

	const actor = await Actor.findById(id);
	if (!actor) return sendError(res, 'Invalid request, actor not found!', 404);
	res.json(formatActor(actor));
};
