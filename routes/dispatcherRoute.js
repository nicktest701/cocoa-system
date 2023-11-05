const router = require('express').Router();
const _ = require('lodash');
const multer = require('multer');
const { randomUUID } = require('crypto');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const Dispatcher = require('../models/dispatcherModel');
const DispatcherTransaction = require('../models/dispatcherTransactionModel');

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/dispatcher/');
  },
  filename: function (req, file, cb) {
    const ext = file?.originalname?.split('.')[1];

    cb(null, `${randomUUID()}.${ext}`);
  },
});
const upload = multer({ storage: Storage });

//@GET Get all dispatchers
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { user } = req.query;
    const dispatchers = await Dispatcher.find({
      user: ObjectId(user),
    });

    res.json(dispatchers);
  })
);

//@GET Get  dispatcher by transactionId
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const dispatcher = await Dispatcher.findById(id);

    res.json(dispatcher);
  })
);

//@POST Add new dispatcher
router.post(
  '/',
  upload.single('profile'),
  asyncHandler(async (req, res) => {
    const newDispatcher = req.body;

    newDispatcher.profile = req.file?.filename;

    const createdDispatcher = await Dispatcher.create(newDispatcher);

    if (_.isEmpty(createdDispatcher)) {
      return res
        .status(404)
        .json('Error saving dispatcher Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@PUT update dispatcher info
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifieddispatcher = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json('invalid dispatcher id');
    }

    const updateddispatcher = await Dispatcher.findByIdAndUpdate(
      id,
      modifieddispatcher,
      {
        upsert: true,
        new: true,
      }
    );

    if (_.isEmpty(updateddispatcher)) {
      return res
        .status(404)
        .json('Error saving dispatcher Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove Multiple Dispatcher

router.put(
  '/delete',
  asyncHandler(async (req, res) => {
    const ids = req.body;

    const removedDispatcher = await Dispatcher.remove({
      _id: {
        $in: ids,
      },
    });

    if (_.isEmpty(removedDispatcher)) {
      return res
        .status(404)
        .json('Error removing Dispatcher. Try again later!!!');
    }

    await DispatcherTransaction.remove({
      dispatcher: {
        $in: ids,
      },
    });

    return res.sendStatus(200);
  })
);

//@DELETE Remove dispatcher by id

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;

    const removedDispatcher = await Dispatcher.findByIdAndDelete(id);

    if (_.isEmpty(removedDispatcher)) {
      return res
        .status(404)
        .json('Error removing Dispatcher. Try again later!!!');
    }

    await DispatcherTransaction.findOneAndDelete({
      dispatcher: new ObjectId(id),
    });

    return res.sendStatus(200);
  })
);

module.exports = router;
