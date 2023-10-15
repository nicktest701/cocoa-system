const router = require('express').Router();
const _ = require('lodash');
const multer = require('multer');
const { randomUUID } = require('crypto');
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose');
const asyncHandler = require('express-async-handler');
const PC = require('../models/pcModel');

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/pc/');
  },
  filename: function (req, file, cb) {
    const ext = file?.originalname?.split('.')[1];

    cb(null, `${randomUUID()}.${ext}`);
  },
});
const upload = multer({ storage: Storage });

//@GET Get all pcs
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pcs = await PC.find({});
    if (!_.isArray(pcs)) {
      return res.status(404).json('Error fetching pcs.Try again later');
    }
    res.json(pcs);
  })
);

//@GET Get  PC by transactionId
router.get(
  '/:user',
  asyncHandler(async (req, res) => {
    const id = req.params.user;

    const pcs = await PC.find({
      user: ObjectId(id),
    });

    res.status(200).json(pcs);
  })
);

//@GET Get all  PC by transactionId
router.get(
  '/all',
  asyncHandler(async (req, res) => {
    const transactionId = req.query.transactionId;
    const PC = await PC.findOne({
      transactionId,
    });

    res.json(PC);
  })
);

//@POST Add new PC
router.post(
  '/',
  upload.single('profile'),
  asyncHandler(async (req, res) => {
    const newPC = req.body;

    newPC.profile = req.file?.filename;

    const createdPC = await PC.create(newPC);

    if (_.isEmpty(createdPC)) {
      return res.status(404).json('Error saving PC Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@PUT update PC info
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.body.id;
    const modifiedPC = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json('invalid PC id');
    }

    const updatedPC = await PC.findByIdAndUpdate(id, modifiedPC, {
      upsert: true,
      new: true,
    });

    if (_.isEmpty(updatedPC)) {
      return res.status(404).json('Error saving PC Info.Try again later!!!');
    }
    res.sendStatus(201);
  })
);

//@DELETE Remove PC by id

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const id = req.query.id;

    if (typeof id === 'string') {
      const removedPC = await PC.findByIdAndDelete(id);
      return res.sendStatus(200);
    }

    if (typeof id === 'object') {
      id.map(async ({ _id }) => {
        await PC.findByIdAndDelete(_id);
      });

      return res.sendStatus(200);
    }
  })
);

module.exports = router;
