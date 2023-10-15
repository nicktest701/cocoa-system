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
    const dispatchers = await Dispatcher.find({});
    if (!_.isArray(dispatchers)) {
      return res.status(404).json('Error fetching dispatchers.Try again later');
    }
    res.json(dispatchers);
  })
);

//@GET Get all  dispatcher by transactionId
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const dispatcher = await Dispatcher.findOne({
      transactionId,
    });

    res.json(dispatcher);
  })
);

//@GET Get  dispatcher by transactionId
router.get(
  '/:user',
  asyncHandler(async (req, res) => {
    const id = req.params.user;
    const dispatcher = await Dispatcher.find({
      user: ObjectId(id),
    });

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

//@DELETE Remove dispatcher by id

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;

    if (typeof id === 'string') {
      const removeddispatcher = await Dispatcher.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === 'object') {
      id.map(async ({ _id }) => {
        await Dispatcher.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
