const { sendError, formatActor } = require('../utils/helper');
const cloudinary = require('../cloud');
const Movie = require('../models/movie');
const { isValidObjectId } = require('mongoose');

exports.uploadTrailer = async (req, res) => {
	const { file } = req;
	if (!file) return sendError(res, 'Video file is missing!');

	const { secure_url: url, public_id } = await cloudinary.uploader.upload(
		file.path,
		{
			resource_type: 'video',
		},
	);
	res.status(201).json({ url, public_id });
};

exports.createMovie = async (req, res) => {
	const { file, body } = req;

	const {
		title,
		storyLine,
		director,
		releaseDate,
		status,
		type,
		genres,
		tags,
		cast,
		writers,
		trailer,
		language,
	} = body;

	const newMovie = new Movie({
		title,
		storyLine,
		releaseDate,
		status,
		type,
		genres,
		tags,
		cast,
		trailer,
		language,
	});

	if (director) {
		if (!isValidObjectId(director))
			return sendError(res, 'Invalid director id!');
		newMovie.director = director;
	}

	if (writers) {
		for (let writerId of writers) {
			if (!isValidObjectId(writerId))
				return sendError(res, 'Invalid writer id!');
		}

		newMovie.writers = writers;
	}

	// uploading poster
	if (file) {
		const {
			secure_url: url,
			public_id,
			responsive_breakpoints,
		} = await cloudinary.uploader.upload(file.path, {
			transformation: {
				width: 1280,
				height: 720,
			},
			responsive_breakpoints: {
				create_derived: true,
				max_width: 640,
				max_images: 3,
			},
		});

		const poster = { url, public_id, responsive: [] };

		const { breakpoints } = responsive_breakpoints[0];
		if (breakpoints.length) {
			for (let imgObj of breakpoints) {
				const { secure_url } = imgObj;
				poster.responsive.push(secure_url);
			}
		}
		newMovie.poster = poster;
	}

	await newMovie.save();

	res.status(201).json({
		id: newMovie._id,
		title,
	});
};

exports.updateMovieWithoutPoster = async (req, res) => {
	const { movieId } = req.params;

	if (!isValidObjectId(movieId)) return sendError(res, 'Invalid movie id');

	const movie = await Movie.findById(movieId);

	if (!movie) return sendError(res, 'Movie not found!', 404);

	const {
		title,
		storyLine,
		director,
		releaseDate,
		status,
		type,
		genres,
		tags,
		cast,
		writers,
		trailer,
		language,
	} = req.body;

	movie.title = title;
	movie.storyLine = storyLine;
	movie.releaseDate = releaseDate;
	movie.status = status;
	movie.type = type;
	movie.genres = genres;
	movie.tags = tags;
	movie.cast = cast;
	movie.trailer = trailer;
	movie.language = language;

	if (director) {
		if (!isValidObjectId(director))
			return sendError(res, 'Invalid director id!');
		movie.director = director;
	}

	if (writers) {
		for (let writerId of writers) {
			if (!isValidObjectId(writerId))
				return sendError(res, 'Invalid writer id!');
		}

		movie.writers = writers;
	}

	await movie.save();

	res.json({ message: 'Movie is updated', movie });
};

exports.updateMovie = async (req, res) => {
	const { movieId } = req.params;
	const { file } = req;

	if (!isValidObjectId(movieId)) return sendError(res, 'Invalid movie id');

	// if (!req.file) return sendError(res, 'Movie poster is missing!');

	const movie = await Movie.findById(movieId);

	if (!movie) return sendError(res, 'Movie not found!', 404);

	const {
		title,
		storyLine,
		director,
		releaseDate,
		status,
		type,
		genres,
		tags,
		cast,
		writers,
		language,
	} = req.body;

	movie.title = title;
	movie.storyLine = storyLine;
	movie.releaseDate = releaseDate;
	movie.status = status;
	movie.type = type;
	movie.genres = genres;
	movie.tags = tags;
	movie.cast = cast;
	movie.language = language;

	if (director) {
		if (!isValidObjectId(director))
			return sendError(res, 'Invalid director id!');
		movie.director = director;
	}

	if (writers) {
		for (let writerId of writers) {
			if (!isValidObjectId(writerId))
				return sendError(res, 'Invalid writer id!');
		}

		movie.writers = writers;
	}

	// update poster
	if (file) {
		//remove old poster from cloudinary
		const publicId = movie.poster?.public_id;
		if (publicId) {
			const { result } = await cloudinary.uploader.destroy(publicId);
			if (result !== 'ok') {
				return sendError(res, 'Could not delete poster from cloudinary!');
			}
		}
		//upload new poster to cloudinary
		const {
			secure_url: url,
			public_id,
			responsive_breakpoints,
		} = await cloudinary.uploader.upload(req.file.path, {
			transformation: {
				width: 1280,
				height: 720,
			},
			responsive_breakpoints: {
				create_derived: true,
				max_width: 640,
				max_images: 3,
			},
		});

		const poster = { url, public_id, responsive: [] };

		const { breakpoints } = responsive_breakpoints[0];
		if (breakpoints.length) {
			for (let imgObj of breakpoints) {
				const { secure_url } = imgObj;
				poster.responsive.push(secure_url);
			}
		}

		movie.poster = poster;
	}

	await movie.save();

	res.json({
		message: 'Movie is updated',
		movie: {
			id: movie._id,
			title: movie.title,
			poster: movie.poster?.url,
			genres: movie.genres,
			status: movie.status,
		},
	});
};

exports.deleteMovie = async (req, res) => {
	const { movieId } = req.params;
	if (!isValidObjectId(movieId)) return sendError(res, 'Invalid movie id!');

	const movie = await Movie.findById(movieId);

	if (!movie) return sendError(res, 'Movie not found', 404);

	//check if there is a poster to delete from cloudinary
	const posterId = movie.poster?.public_id;
	console.log(posterId);
	if (posterId) {
		const { result } = await cloudinary.uploader.destroy(posterId);
		console.log(result);
		if (result !== 'ok')
			return sendError(res, 'Could not remove poster from cloudinary');
	}

	const trailerId = movie.trailer?.public_id;
	if (!trailerId) return sendError(res, 'Could not find trailer');

	const { result } = await cloudinary.uploader.destroy(trailerId, {
		resource_type: 'video',
	});

	if (result !== 'ok')
		return sendError(res, 'Could not remove trailer from cloudinary');

	await Movie.findByIdAndDelete(movieId);
	res.json({ message: 'Movie deleted successfully' });
};

exports.getMovies = async (req, res) => {
	const { pageNo = 0, limit = 10 } = req.query;
	const movies = await Movie.find({})
		.sort({ createdAt: -1 })
		.skip(parseInt(pageNo) * parseInt(limit))
		.limit(parseInt(limit));

	const results = movies.map((movie) => ({
		id: movie._id,
		title: movie.title,
		poster: movie.poster?.url,
		genres: movie.genres,
		status: movie.status,
	}));

	res.json({ movies: results });
};

exports.getMovieForUpdate = async (req, res) => {
	const { movieId } = req.params;

	if (!isValidObjectId(movieId)) return SendError(res, 'Id is invalid!');
	const movie = await Movie.findById(movieId).populate(
		'director writers cast.actor',
	);

	res.json({
		movie: {
			id: movie.id,
			title: movie.title,
			storyLine: movie.storyLine,
			poster: movie.poster?.url,
			releaseDate: movie.releaseDate,
			status: movie.status,
			type: movie.type,
			language: movie.language,
			genres: movie.genres,
			tags: movie.tags,
			director: formatActor(movie.director),
			writers: movie.writers.map((w) => formatActor(w)),
			cast: movie.cast.map((c) => {
				return {
					id: c.id,
					profile: formatActor(c.actor),
					roleAs: c.roleAs,
					leadActor: c.leadActor,
				};
			}),
		},
	});
};

exports.searchMovies = async (req, res) => {
	const { title } = req.query;

	if (!title.trim()) return sendError(res, 'Invalid request!');

	const movies = Movie.find({ title: { $regex: title, $options: 'i' } });

	res.json({
		results: (await movies).map((m) => {
			return {
				id: m._id,
				title: m.title,
				poster: m.poster?.url,
				genres: m.genres,
				status: m.status,
			};
		}),
	});
};
