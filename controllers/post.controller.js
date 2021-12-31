const postModel = require('../models/post.models');
const userModel = require('../models/user.models');
const objectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

module.exports.readPost = (req, res) => {
    postModel.find((err, data) => {
        if (!err) res.send(data);
        else console.log('Error to get data : ' + err);
    }).sort({ createdAt: -1 });
}

module.exports.createPost = async (req, res) => {
    let fileName;

    if (req.file !== null) {
        try {
            if (
                req.file.detectedMimeType != 'image/jpg' &&
                req.file.detectedMimeType != 'image/png' &&
                req.file.detectedMimeType != 'image/jpeg'
            )
                throw Error('invalid file');

            if (req.file.size > 500000) throw Error('max size');
        } catch (err) {
            const errors = uploadErrors(err);
            return res.status(201).json({ errors });
        }
        fileName = req.body.posterId + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/posts/${fileName}`
            )
        );
    }
    const newPost = new postModel({
        posterId: req.body.posterId,
        message: req.body.message,
        picture: req.file !== null ? './uploads/posts/' + fileName : '',
        video: req.body.video,
        likers: [],
        comments: [],
    });

    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.updatePost = (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send(' ID unknown : ' + req.params.id)

    const updatedRecord = {
        message: req.body.message,
    };

    postModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true },
        (err, data) => {
            if (!err) res.send(data);
            else console.log('Update error : ' + err);
        }
    );
}

module.exports.deletePost = (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send(' ID unknown : ' + req.params.id)

    postModel.findByIdAndRemove(req.params.id, (err, data) => {
        if (!err) res.send(data);
        else console.log('Delete error : ' + err);
    });
}

module.exports.likePost = async (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        await postModel.findByIdAndUpdate(
            req.params.id,
            {
                // on ajoute au tableau likers une donnée
                $addToSet: { likers: req.body.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

        await userModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.unlikePost = async (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        await postModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

        await userModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.commentPost = (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        return postModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    },
                },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.editCommentPost = (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        return postModel.findById(req.params.id, (err, data) => {
            const theComment = data.comments.find((comment) =>
                comment._id.equals(req.body.commentId)
            );

            if (!theComment) return res.status(404).send('Comment not found');
            theComment.text = req.body.text;

            return data.save((err) => {
                if (!err) return res.status(200).send(data);
                return res.status(500).send(err);
            });
        });
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.deleteCommentPost = (req, res) => {
    if (!objectId.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        return postModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};
