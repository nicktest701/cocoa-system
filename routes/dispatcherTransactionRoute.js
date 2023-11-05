const router = require('express').Router();
const _ = require('lodash');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const DispatcherTransaction = require('../models/dispatcherTransactionModel');
const Stock = require('../models/stockModel');

//@GET Get all dispatcher transaction
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { session, dispatcher } = req.query;

    const dispatcherTransaction = await DispatcherTransaction.find({
      dispatcher: ObjectId(dispatcher),
      session,
    }).sort({ date: 1 });

    res.json(dispatcherTransaction);
  })
);

//@GET Get  dispatcherTransaction by id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const dispatcherTransaction = await DispatcherTransaction.findById(id);

    res.json(dispatcherTransaction);
  })
);

//@POST Add new dispatcherTransaction
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const newdispatcherTransaction = req.body;
    const { session } = req.query;

    const createddispatcherTransaction = await DispatcherTransaction.create(
      newdispatcherTransaction
    );

    if (_.isEmpty(createddispatcherTransaction)) {
      return res
        .status(404)
        .json('Error saving dispatcherTransaction Info.Try again later!!!');
    }

    const decrementValue = -Math.abs(newdispatcherTransaction?.quantity);
    // console.log(decrementValue);
    const updatedStock = await Stock.findOneAndUpdate(
      {
        user: new ObjectId(newdispatcherTransaction?.user),
        session: newdispatcherTransaction?.session,
      },
      {
        $inc: {
          total: decrementValue,
        },
      },
      { new: true, upsert: true }
    );

    if (_.isEmpty(updatedStock)) {
      return res
        .status(404)
        .json('Error saving dispatcherTransaction Info.Try again later!!!');
    }

    res.sendStatus(201);
  })
);

//@PUT update dispatcherTransaction info
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifieddispatcherTransaction = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json('invalid dispatcher Transaction id');
    }

    const updateddispatcherTransaction =
      await DispatcherTransaction.findByIdAndUpdate(
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
        .json('Error saving dispatcher Transaction Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove Multiple DispatcherTransaction

router.put(
  '/delete',
  asyncHandler(async (req, res) => {
    const ids = req.body;

    const removedDispatcherTransaction = await DispatcherTransaction.deleteMany(
      {
        _id: {
          $in: ids,
        },
      }
    );

    if (_.isEmpty(removedDispatcherTransaction)) {
      return res
        .status(404)
        .json('Error removing transactions. Try again later!!!');
    }

    return res.sendStatus(200);
  })
);

//@DELETE Remove dispatcherTransaction by id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;

    const removedDispatcherTransaction =
      await DispatcherTransaction.findByIdAndDelete(id);

    if (_.isEmpty(removedDispatcherTransaction)) {
      return res
        .status(404)
        .json('Error removing transactions. Try again later!!!');
    }

    return res.sendStatus(200);
  })
);

module.exports = router;
