const multer = require('multer');
const storage = multer.diskStorage({});

const fileFilter = (req, file, callback) => {
	if (!file.mimetype.startsWith('image')) {
		callback('only image files are supported', false);
	}
	callback(null, true);
};

exports.uploadImage = multer({ storage, fileFilter });
