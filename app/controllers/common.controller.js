const Comment = require("../models/comment.model");
const User = require("../models/user.model");

exports.fetchAll = (req, res) => {
  const { username } = req.session.user;
  const coinsPromise = User.findOne({ username: username }).then((user) => {
    return user.coins;
  });
  const usersPromise = User.find({ username: { $ne: username }}, {
    username: 1,
    coins: 1,
  })
    .then((users) => {
      return users;
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
  const commentsPromise = Comment.find()
    .sort({ createdAt: -1 })
    .then((comments) => {
      return comments;
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
  Promise.all([coinsPromise, usersPromise, commentsPromise])
    .then((items) => {
      req.session.user.coins = items[0];
      res.render("index", {
        username: req.session.user.username,
        coins: items[0],
        friends: items[1],
        comments: items[2],
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
};

exports.postComment = (req, res) => {
  if (!req.body.content) {
    return res.redirect("/");
  }

  const comment = new Comment({
    username: req.session.user.username,
    content: req.body.content,
  });

  comment
    .save()
    .then((data) => {
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
};
