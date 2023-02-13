const Comment = require("../models/comment.model");
const User = require("../models/user.model");

exports.fetchAll = (req, res) => {
  const { username } = req.session.user;
  const userPromise = User.findOne({ username: username }).populate(
    "inventory.item"
  );
  const usersPromise = User.find(
    { username: { $ne: username } },
    {
      username: 1,
      coins: 1,
    }
  )
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
  Promise.all([userPromise, usersPromise, commentsPromise])
    .then((fulfilled) => {
      const user = fulfilled[0];
      req.session.user = user;
      res.render("index", {
        username: user.username,
        inventory: user.inventory,
        friends: fulfilled[1],
        comments: fulfilled[2],
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
