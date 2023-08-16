const router = require("express").Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const PCTransaction = require("../models/pcTransactionModel");

//@GET Get all PC transaction
router.get(
  "/",
  asyncHandler(async (req, res) => {
    console.log("hello");
    const transactionId = req.query.transactionId;

    const pcTransaction = await PCTransaction.find({
      transactionId,
    }).sort({ createdAt: 1 });
    if (!_.isArray(pcTransaction)) {
      return res
        .status(404)
        .json("Error fetching PC Transactions.Try again later");
    }
    res.json(pcTransaction);
  })
);

//@GET Get  pcTransaction by transactionId
router.get(
  "/:transactionId",
  asyncHandler(async (req, res) => {
    console.log("hello2");
    const transactionId = req.query.transactionId;
    const pcTransaction = await PCTransaction.findOne({
      transactionId,
    });

    res.json(pcTransaction);
  })
);

//@GET Get all  pcTransaction by transactionId
router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const pcTransaction = await PCTransaction.findOne({
      transactionId,
    });

    res.json(pcTransaction);
  })
);

//@POST Add new pcTransaction
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newPCTransaction = req.body;

    const createdPCTransaction = await PCTransaction.create(newPCTransaction);

    if (_.isEmpty(createdPCTransaction)) {
      return res
        .status(404)
        .json("Error saving pcTransaction Info.Try again later!!!");
    }

    res.sendStatus(201);
  })
);

//@PUT update pcTransaction info
router.put(
  "/",
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifiedPCTransaction = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json("invalid PC Transaction id");
    }

    const updatedPCTransaction = await PCTransaction.findByIdAndUpdate(
      id,
      modifiedPCTransaction,
      {
        upsert: true,
        new: true,
      }
    );

    if (_.isEmpty(updatedPCTransaction)) {
      return res
        .status(404)
        .json("Error saving PC Transaction Info.Try again later!!!");
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove pcTransaction by id
router.delete(
  "/",
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    if (typeof id === "string") {
      const removedPCTransaction = await PCTransaction.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === "object") {
      id.map(async ({ _id }) => {
        await PCTransaction.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
