const Item = require("../models/item.model");

exports.add = (req, res) => {
  let invalidFound = false;
  let items = req.body.map((item) => {
    const { id } = item;
    if (!id) {
      invalidFound = true;
    }
    return {
      displayName: item.displayName || "",
      id: item.id,
      rarityScore: item.rarityScore || 0,
      category: item.category || "miscellaneous",
    };
  });

  if (invalidFound) {
    return res.status(400).send({
      message: "Missing item ID.",
    });
  } else {
    Item.insertMany(items)
      .then((data) => {
        return res.send(data);
      })
      .catch((err) => {
        console.log(err);
        return res.end();
      });
  }
};

exports.fetchAll = (req, res) => {
  Item.find()
    .then((items) => {
      return res.render("items", {
        items: items,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.end();
    });
};

exports.fetchRandom = (req, res) => {
  Item.aggregate([
    {
      $facet: {
        currency: [{ $match: { id: "gold_piece" } }],
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
            "currency",
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
      return res.end();
    })
    .catch((err) => {
      console.log(err);
      return res.end();
    });
};
