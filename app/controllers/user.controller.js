const utils = require("../../utils");
const User = require("../models/user.model");
const Item = require("../models/item.model");

exports.create = (req, res) => {
  if (!req.body.username) {
    return res.redirect("/create?error=empty");
  }

  if (req.body.username.length > 30) {
    return res.redirect("/create?error=toolong");
  }

  Item.findOne({ id: "gold_piece" })
    .then((goldPiece) => {
      Item.aggregate([
        {
          $facet: {
            equipment: [
              { $match: { category: "equipment" } },
              { $sample: { size: 2 } },
            ],
            food: [{ $match: { category: "food" } }, { $sample: { size: 4 } }],
            miscellaneous: [
              { $match: { category: "miscellaneous" } },
              { $sample: { size: 6 } },
            ],
            companion: [
              { $match: { category: "companion" } },
              { $sample: { size: 1 } },
            ],
          },
        },
        {
          $project: {
            _id: 0,
            data: {
              $concatArrays: [
                "$equipment",
                "$food",
                "$miscellaneous",
                "$companion",
              ],
            },
          },
        },
        {
          $unwind: "$data",
        },
        {
          $replaceRoot: {
            newRoot: "$data",
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ])
        .then((items) => {
          const user = new User({
            username: req.body.username,
            accessCode: utils.generateAccessCode(),
            inventory: [
              {
                item: goldPiece._id,
                quantity: 100,
              },
              ...items.map((item) => ({ item: item._id, quantity: 1 })),
            ],
          });

          user
            .save()
            .then((data) => {
              return res.redirect(
                `/confirm/?username=${data.username}&accessCode=${data.accessCode}`
              );
            })
            .catch((err) => {
              console.log(err);
              return res.redirect(`/create?error=${err.code}`);
            });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.findAll = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
};

exports.fetchAccount = (req, res) => {
  const { username } = req.session.user;
  User.findOne(
    { username: username },
    {
      storage: 0,
      accessCode: 0,
      __v: 0,
      _id: 0,
      "inventory._id": 0,
    }
  )
    .populate("inventory.item", "-_id -__v -createdAt -updatedAt")
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      res.send(user);
    })
    .catch((err) => {
      console.log(err);
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
        console.log(err);
        return res.redirect("/");
      }
      res.send(user);
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
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
      console.log(err);
      return res.redirect("/");
    });
};

exports.collectData = (req, res) => {
  const { username } = req.params;

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
      console.log(err);
      return res.end();
    });
};

exports.deleteStorage = (req, res) => {
  const { username } = req.params;

  User.findOneAndUpdate(
    { username: username },
    {
      $set: {
        storage: [],
      },
    },
    { new: true }
  )
    .then((user) => {
      return res.end();
    })
    .catch((err) => {
      console.log(err);
      return res.end();
    });
};

exports.transfer = (req, res) => {
  const { username: recipientUsername, itemId, amount } = req.body;
  const sender = req.session.user;

  if (!recipientUsername || !itemId || amount < 0) {
    return res.redirect("/");
  }

  User.find({ username: { $in: [sender.username, recipientUsername] } })
    .populate("inventory.item")
    .then((users) => {
      const senderUser = users.find(
        (user) => user.username === sender.username
      );
      const recipientUser = users.find(
        (user) => user.username === recipientUsername
      );
      if (senderUser && recipientUser) {
        const senderItemIndex = senderUser.inventory.findIndex(
          (item) => item.item.id === itemId
        );
        const { transferAmount, updatedBalance } = utils.getUpdatedBalances(
          amount,
          senderUser.inventory[senderItemIndex].quantity
        );
        if (senderItemIndex > -1) {
          if (updatedBalance > 0) {
            senderUser.inventory[senderItemIndex].quantity = updatedBalance;
          } else {
            senderUser.inventory.splice(senderItemIndex, 1);
          }
        }

        const recipientItemIndex = recipientUser.inventory.findIndex(
          (item) => item.item.id === itemId
        );
        let addItemPromise = null;
        if (recipientItemIndex > -1) {
          recipientUser.inventory[recipientItemIndex].quantity +=
            +transferAmount;
        } else {
          addItemPromise = Item.findOne({ id: itemId }).then((item) => {
            recipientUser.inventory.push({
              item: item._id,
              quantity: transferAmount,
            });
          });
        }

        Promise.resolve(addItemPromise)
          .then(() => {
            senderUser.markModified("inventory");
            recipientUser.markModified("inventory");
            const senderPromise = senderUser.save();
            const recipientPromise = recipientUser.save();

            Promise.all([senderPromise, recipientPromise])
              .then((data) => {
                return res.redirect("/");
              })
              .catch((err) => {
                console.log(err);
                return res.redirect("/");
              });
          })
          .catch((err) => {
            console.log(err);
            return res.redirect("/");
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
};

exports.delete = (req, res) => {
  User.findOneAndRemove({ username: req.params.username })
    .then((user) => {
      return res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/");
    });
};
