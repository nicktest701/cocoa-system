const router = require("express").Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const DispatcherTransaction = require("../models/dispatcherTransactionModel");

//@GET Get all dispatcher transaction
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;

    const dispatcherTransaction = await DispatcherTransaction.find({
      transactionId,
    }).sort({ createdAt: 1 });
    if (!_.isArray(dispatcherTransaction)) {
      return res
        .status(404)
        .json("Error fetching dispatcher Transactions.Try again later");
    }
    res.json(dispatcherTransaction);
  })
);

//@GET Get  dispatcherTransaction by transactionId
router.get(
  "/:transactionId",
  asyncHandler(async (req, res) => {
  
    const transactionId = req.query.transactionId;
    const dispatcherTransaction = await DispatcherTransaction.findOne({
      transactionId,
    });

    res.json(dispatcherTransaction);
  })
);

//@GET Get all  dispatcherTransaction by transactionId
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const dispatcherTransaction = await DispatcherTransaction.findOne({
      transactionId,
    });

    res.json(dispatcherTransaction);
  })
);

//@POST Add new dispatcherTransaction
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newdispatcherTransaction = req.body;

    const createddispatcherTransaction = await DispatcherTransaction.create(newdispatcherTransaction);

    if (_.isEmpty(createddispatcherTransaction)) {
      return res
        .status(404)
        .json("Error saving dispatcherTransaction Info.Try again later!!!");
    }

    res.sendStatus(201);
  })
);

//@PUT update dispatcherTransaction info
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifieddispatcherTransaction = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json("invalid dispatcher Transaction id");
    }

    const updateddispatcherTransaction = await DispatcherTransaction.findByIdAndUpdate(
      id,
      modifieddispatcherTransaction,
      {
        upsert: true,
        new: true,
      }
    );

    if (_.isEmpty(updateddispatcherTransaction)) {
      return res
        .status(404)
        .json("Error saving dispatcher Transaction Info.Try again later!!!");
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove dispatcherTransaction by id
router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    if (typeof id === "string") {
      const removeddispatcherTransaction = await DispatcherTransaction.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === "object") {
      id.map(async ({ _id }) => {
        await DispatcherTransaction.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
