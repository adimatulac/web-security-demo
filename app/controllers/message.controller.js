const Message = require("../models/message.model");

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
