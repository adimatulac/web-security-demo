const utils = require("../../utils");
const User = require("../models/user.model");

exports.create = (req, res) => {
  if (!req.body.username) {
    return res.redirect("/create?msg=fail");
  }

  const user = new User({
    username: req.body.username,
    accessCode: utils.generateAccessCode(),
    coins: 100,
  });

  user
    .save()
    .then((data) => {
      return res.redirect(
        `/confirm/?username=${data.username}&accessCode=${data.accessCode}`
      );
    })
    .catch((err) => {
      return res.redirect("/login");
    });
};

exports.findAll = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      return res.redirect("/");
    });
};

exports.fetchAccount = (req, res) => {
  const { username } = req.session.user;
  User.findOne({ username: username }, { storage: 0 })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      res.send(user);
    })
    .catch((err) => {
      return res.redirect("/");
    });
};

exports.topUp = (req, res) => {
  if (!req.params.username) {
    return res.redirect("/");
  }

  User.findOneAndUpdate(
    { username: req.params.username },
    { coins: req.body.coins },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: "User not found with username " + req.params.username,
        });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "User not found with username " + req.params.username,
        });
      }
      return res.status(500).send({
        message: "Error updating user with username " + req.params.username,
      });
    });
};

exports.fetchStorage = (req, res) => {
  const { username } = req.session.user;
  User.findOne({ username: username })
    .then((user) => {
      if (user) {
        return res.render("storage", {
          storage: user.storage,
        });
      }
      return res.redirect("/");
    })
    .catch((err) => {
      return res.redirect("/");
    });
};

exports.collectData = (req, res) => {
  const { username } = req.params;
  console.log(req.query);

  const { username: acquiredUsername, data } = req.query;
  User.findOneAndUpdate(
    { username: username },
    {
      $push: {
        storage: { username: acquiredUsername, data: data },
      },
    },
    { new: true }
  )
    .then((user) => {
      return res.end();
    })
    .catch((err) => {
      return res.end();
    });
};

exports.transfer = (req, res) => {
  const { username: recipientUsername, amount } = req.body;
  const sender = req.session.user;

  if (!recipientUsername || amount < 0) {
    return res.redirect("/");
  }

  const userUpdates = User.findOne({ username: recipientUsername })
    .then((recipient) => {
      if (recipient) {
        let transferAmount = amount;
        let updatedBalance = sender.coins;

        if (transferAmount <= sender.coins) {
          updatedBalance = sender.coins - transferAmount;
        } else {
          transferAmount = sender.coins;
          updatedBalance = 0;
        }

        const senderPromise = User.findOneAndUpdate(
          { username: sender.username },
          { coins: updatedBalance },
          { new: true }
        );
        const recipientPromise = User.findOneAndUpdate(
          { username: recipientUsername },
          { $inc: { coins: transferAmount } },
          { new: true }
        );
        return Promise.all([senderPromise, recipientPromise])
          .then((result) => {
            return result;
          })
          .catch((err) => {
            return err;
          });
      }
      return null;
    })
    .catch((err) => {
      return null;
    });
  userUpdates
    .then((updates) => {
      return res.redirect("/");
    })
    .catch((err) => {
      return res.redirect("/");
    });
};

exports.delete = (req, res) => {
  User.findOneAndRemove({ username: req.params.username })
    .then((user) => {
      return res.redirect("/");
    })
    .catch((err) => {
      return res.redirect("/");
    });
};
