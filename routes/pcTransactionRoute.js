const router = require('express').Router();
const _ = require('lodash');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const PCTransaction = require('../models/pcTransactionModel');
const PC = require('../models/pcModel');
//@GET Get all PC transaction
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;

    const pcTransaction = await PCTransaction.find({
      transactionId,
    }).sort({ date: 1 });
    if (!_.isArray(pcTransaction)) {
      return res
        .status(404)
        .json('Error fetching PC Transactions.Try again later');
    }
    res.json(pcTransaction);
  })
);

//@GET Get all  pcTransaction by transactionId
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const pcTransaction = await PCTransaction.findOne({
      transactionId,
    });

    res.json(pcTransaction);
  })
);

//@GET Get ALL Cummulative
router.get(
  '/cummulative',
  asyncHandler(async (req, res) => {
    const userId = req.query.id;

    const clerks = await PC.find({
      user: new ObjectId(userId),
    });

    const modifiedPCTransaction = clerks.map(async (clerk) => {
      const transaction = await PCTransaction.find({
        user: new ObjectId(userId),
        pc: new ObjectId(clerk?._id),
      });

      if (!_.isEmpty(transaction)) {
        const lastTransaction = _.last(
          _.orderBy(transaction, 'createdAt', 'asc')
        );

        return {
          fullName: _.upperCase(`${clerk?.firstName} ${clerk?.lastName}`),
          telephone: clerk?.telephone,
          date: lastTransaction?.date,
          advance: lastTransaction?.advance,
          advanceCummulative: lastTransaction?.advanceCummulative,
          delivered: lastTransaction?.delivered,
          deliveredCummulative: lastTransaction?.deliveredCummulative,
          outstanding: lastTransaction?.outstanding,
        };
      }
    });

    const trans = await Promise.all(modifiedPCTransaction);

    const pcTransactions = trans.filter((item) => item !== undefined);

    res.json(pcTransactions);
  })
);

//@GET Get  pcTransaction by transactionId
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const pcTransaction = await PCTransaction.find({
      pc: ObjectId(id),
    }).sort({
      date: 1,
    });

    res.json(pcTransaction);
  })
);

//@POST Add new pcTransaction
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const newPCTransaction = req.body;

    const createdPCTransaction = await PCTransaction.create(newPCTransaction);

    if (_.isEmpty(createdPCTransaction)) {
      return res
        .status(404)
        .json('Error saving pcTransaction Info.Try again later!!!');
    }

    res.sendStatus(201);
  })
);

//@PUT update pcTransaction info
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifiedPCTransaction = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json('invalid PC Transaction id');
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
        .json('Error saving PC Transaction Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove Multiple Company

router.put(
  '/delete',
  asyncHandler(async (req, res) => {
    const ids = req.body;

    const removedPC = await PCTransaction.remove({
      _id: {
        $in: ids,
      },
    });

    if (_.isEmpty(removedPC)) {
      return res
        .status(404)
        .json('Error removing transactions.Try again later!!!');
    }

    return res.sendStatus(200);
  })
);

//@DELETE Remove pcTransaction by id
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;
    if (typeof id === 'string') {
      const removedPCTransaction = await PCTransaction.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === 'object') {
      id.map(async ({ _id }) => {
        await PCTransaction.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
