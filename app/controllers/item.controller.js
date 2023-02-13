const Item = require("../models/item.model");

exports.add = (req, res) => {
  let items = req.body.map((item) => {
    return {
      displayName: item.displayName,
      id: item.id,
      rarityScore: item.rarityScore,
      category: item.category,
    };
  });

  Item.insertMany(items)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.end();
    });
};

exports.fetchAll = (req, res) => {
  Item.find()
    .then((items) => {
      return res.render("items", {
        items: items
      });
    })
    .catch((err) => {
      console.log(err);
      res.end();
    });
};

exports.fetchRandom = (req, res) => {
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
        _id: 1
      }
    }
  ])
    .then((items) => {
      console.log("LOGGING: ", items);
      res.end();
    })
    .catch((err) => res.end());
};
