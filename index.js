const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const {checkUser, requireAuth} = require('./middleware/auth.middleware');
const cors = require('cors');

const app = express();

app.use(cors());

require('dotenv').config({ path: './config/.env' })
require('./config/database');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);


// A chaque requête le user va être vérifié
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
  });

app.listen(process.env.PORT, () => {
    console.log(`Ecoute le port ${process.env.PORT}`);
})