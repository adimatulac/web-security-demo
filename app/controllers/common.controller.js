const Message = require("../models/message.model");
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
  const messagesPromise = Message.find()
    .sort({ createdAt: -1 })
    .then((messages) => {
      return messages;
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
  Promise.all([userPromise, usersPromise, messagesPromise])
    .then((fulfilled) => {
      const user = fulfilled[0];
      req.session.user = user;
      res.render("index", {
        username: user.username,
        inventory: user.inventory,
        friends: fulfilled[1],
        messages: fulfilled[2],
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/");
    });
};

exports.postMessage = (req, res) => {
  if (!req.body.content) {
    return res.redirect("/");
  }

  const message = new Message({
    username: req.session.user.username,
    content: req.body.content,
    rotation: Math.random() * 1.5 * (Math.round(Math.random()) ? 1 : -1),
  });

  message
    .save()
    .then((data) => {
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
};
