const express = require('express');
require('express-async-errors');
const { errorHandler } = require('./middlewares/errorHandler');
const cors = require('cors');

//routes
const userRouter = require('./routes/user');
const actorRouter = require('./routes/actor');
const movieRouter = require('./routes/movie');
const reviewRouter = require('./routes/review');
const adminRouter = require('./routes/admin');
const { handleNotFound } = require('./utils/helper');

require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
require('./db/');

app.use('/api/user', userRouter);
app.use('/api/actor', actorRouter);
app.use('/api/movie', movieRouter);
app.use('/api/review', reviewRouter);
app.use('/api/admin', adminRouter);

app.use('/*', handleNotFound);

app.use(errorHandler);

app.listen(process.env.PORT, () =>
	console.log('server app listening on port ' + process.env.PORT),
);
