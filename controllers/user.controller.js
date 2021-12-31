const userModel = require('../models/user.models');
const objectId = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await userModel.find().select('-password');
    res.status(200).json(users);
}

module.exports.userInfo = (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send(' ID unknown : ' + req.params.id)

    userModel.findById(req.params.id, (err, data) => {
        if (!err) res.send(data);
        else console.log(' ID unknown : ' + err);
    }).select('-password');
};

module.exports.updateUser = async (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await userModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    bio: req.body.bio,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.deleteUser = async (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await userModel.remove({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Successfully deleted. " });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.follow = async (req, res) => {
    if (
        !objectId.isValid(req.params.id) ||
        !objectId.isValid(req.body.idToFollow)
    )
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        // ajouter à la liste des followers, un follower
        await userModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true }
                .then((data) => res.send(data))
                .catch((err) => res.status(500).send({ message: err }))),

            // Ajouter à la liste des followers
            await userModel.findByIdAndUpdate(
                req.body.idToFollow,
                { $addToSet: { followers: req.params.id } },
                { new: true, upsert: true }
                    .then((data) => res.send(data))
                    .catch((err) => res.status(500).send({ message: err })))
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

module.exports.unfollow = async (req, res) => {
    if (
        !objectId.isValid(req.params.id) ||
        !objectId.isValid(req.body.idToUnfollow)
    )
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        await userModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { following: req.body.idToUnfollow } },
            { new: true, upsert: true }
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }))),

        // Retirer de la liste des followers
        await userModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id } },
            { new: true, upsert: true }
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err })))
    } catch (err) {
        return res.status(500).json({ message: err });
    }
}
