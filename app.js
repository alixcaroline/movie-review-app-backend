const express = require('express');

//routes
const userRouter = require('./routes/user');

const app = express();
app.use(userRouter);

app.listen(8000, () => console.log('server app listening on port 8000'));
