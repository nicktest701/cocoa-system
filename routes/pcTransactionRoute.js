const router = require('express').Router();
const _ = require('lodash');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const PCTransaction = require('../models/pcTransactionModel');
const PC = require('../models/pcModel');
const Stock = require('../models/stockModel');

//@GET Get  pcTransaction by transactionId

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { session, id } = req.query;

    const pcTransaction = await PCTransaction.find({
      pc: ObjectId(id),
      session,
    }).sort({
      date: 1,
    });

    res.json(pcTransaction);
  })
);

//@GET Get ALL Cummulative
router.get(
  '/cummulative',
  asyncHandler(async (req, res) => {
    const { session, id } = req.query;

    const clerks = await PC.find({
      user: new ObjectId(id),
    });

    const modifiedPCTransaction = clerks.map(async (clerk) => {
      const transaction = await PCTransaction.find({
        user: new ObjectId(id),
        pc: new ObjectId(clerk?._id),
        session,
      });
      // console.log(transaction)

      if (!_.isEmpty(transaction)) {
        const lastTransaction = _.last(
          _.orderBy(transaction, 'createdAt', 'asc')
        );

        const advanceCummulative = _.sumBy(transaction, 'advance');
        const deliveredCummulative = _.sumBy(transaction, 'delivered');
        const outstanding = advanceCummulative - deliveredCummulative;

        return {
          fullName: _.upperCase(`${clerk?.firstName} ${clerk?.lastName}`),
          telephone: clerk?.telephone,
          date: lastTransaction?.date,
          advanceCummulative,
          deliveredCummulative,
          outstanding,
        };
      }
    });

    const trans = await Promise.all(modifiedPCTransaction);

    const pcTransactions = trans.filter((item) => item !== undefined);

    res.json(pcTransactions);
  })
);
//@GET Get all  pcTransaction by transactionId
router.get(
  '/closing-stock',
  asyncHandler(async (req, res) => {
    const { id, session } = req.query;

    const stock = await Stock.findOne({
      user: new ObjectId(id),
      session,
    });

    // console.log(stock);

    if (_.isNull(stock) || _.isEmpty(stock)) {
      let closingStock = 0;
      const pcOverallTransaction = await PCTransaction.find({
        user: new ObjectId(id),
        session,
      });
      if (!_.isNull(pcOverallTransaction)) {
        closingStock = _.sumBy(pcOverallTransaction, 'delivered');
      }

      await Stock.create({
        user: new ObjectId(id),
        total: closingStock,
        session,
      });
      return res.status(200).json(closingStock);
    }

    res.status(200).json(stock?.total);
  })
);

//@GET Get all  pcTransaction by Id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const pcTransaction = await PCTransaction.findById(id);

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

    await Stock.findOneAndUpdate(
      { user: new ObjectId(newPCTransaction?.user), session: req.body.session },
      {
        $inc: {
          total: newPCTransaction?.delivered,
        },
      },
      { new: true, upsert: true }
    );

    res.sendStatus(201);
  })
);

//@GET Get all  pcTransaction by transactionId
router.post(
  '/daily-cummulative',
  asyncHandler(async (req, res) => {
    const { date, userId } = req.body;

    const pcTransaction = await PCTransaction.find({
      user: new ObjectId(userId),
      date: new Date(date),
    })
      .populate('pc')
      .sort('createdAt');

    res.status(200).json(pcTransaction);
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

    const removedPC = await PCTransaction.deleteMany({
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
    const removedPCTransaction = await PCTransaction.findByIdAndDelete(id);
    res.sendStatus(200);
  })
);

module.exports = router;
