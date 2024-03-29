const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middlewares/auth');
const { uploadVideo, uploadImage } = require('../middlewares/multer');
const {
	uploadTrailer,
	createMovie,
	updateMovie,
	deleteMovie,
	getMovies,
	getMovieForUpdate,
	searchMovies,
	getLatestUploads,
	getSingleMovie,
	getRelatedMovies,
	getTopRatedMovies,
	searchPublicMovies,
} = require('../controllers/movie');
const { parseData } = require('../utils/helper');
const {
	validateMovie,
	validate,
	validateTrailer,
} = require('../middlewares/validator');

router.post(
	'/upload-trailer',
	isAuth,
	isAdmin,
	uploadVideo.single('video'),
	uploadTrailer,
);

router.post(
	'/create',
	isAuth,
	isAdmin,
	uploadImage.single('poster'),
	parseData,
	validateMovie,
	validateTrailer,
	validate,
	createMovie,
);

// router.patch(
// 	'/update-movie-without-poster/:movieId',
// 	isAuth,
// 	isAdmin,
// 	parseData,
// 	validateMovie,
// 	validate,
// 	updateMovieWithoutPoster,
// );

router.patch(
	'/update/:movieId',
	isAuth,
	isAdmin,
	uploadImage.single('poster'),
	parseData,
	validateMovie,
	validate,
	updateMovie,
);

router.delete('/:movieId', isAuth, isAdmin, deleteMovie);

router.get('/movies', isAuth, isAdmin, getMovies);

router.get('/for-update/:movieId', isAuth, isAdmin, getMovieForUpdate);

router.get('/search', isAuth, isAdmin, searchMovies);

//for normal users
router.get('/latest-uploads', getLatestUploads);
router.get('/single/:movieId', getSingleMovie);
router.get('/related/:movieId', getRelatedMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/search-public', searchPublicMovies);

module.exports = router;
