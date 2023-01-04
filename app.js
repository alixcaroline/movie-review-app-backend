const express = require('express');
require('express-async-errors');
const { errorHandler } = require('./middlewares/errorHandler');

//routes
const userRouter = require('./routes/user');

require('dotenv').config();
const app = express();
app.use(express.json());
require('./db/');

app.use('/api/user', userRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () =>
	console.log('server app listening on port ' + process.env.PORT),
);
