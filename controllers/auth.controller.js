const userModel = require('../models/user.models');
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
};

// Inscription
module.exports.signUp = async (req, res) => {
    console.log(req.body);
    const { pseudo, email, password } = req.body

    try {
        const user = await userModel.create({ pseudo, email, password });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = signUpErrors(err);
        res.status(200).send({ errors })
    }
}

// Connexion
module.exports.signIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await userModel.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge });
        res.status(200).json({ user: user._id })
    } catch (err) {
        const errors = signInErrors(err);
        res.status(200).json(err);
    }
}

// Déconnexion avec jsonwebtoken
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    // Pour que la requête dans postman aboutisse
    res.redirect('/');
}