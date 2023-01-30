const multer = require('multer');
const storage = multer.diskStorage({});

const imageFileFilter = (req, file, callback) => {
	if (!file.mimetype.startsWith('image')) {
		callback('only image files are supported', false);
	}
	callback(null, true);
};
const videoFileFilter = (req, file, callback) => {
	if (!file.mimetype.startsWith('video')) {
		callback('only video files are supported', false);
	}
	callback(null, true);
};

exports.uploadImage = multer({ storage, imageFileFilter });

exports.uploadVideo = multer({ storage, videoFileFilter });
