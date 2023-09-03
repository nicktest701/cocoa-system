const mongoose = require('mongoose');

let URL = 'mongodb://127.0.0.1:27017/CocoaSystem';


if (process.env.NODE_ENV === 'production') {
  URL =
    'mongodb+srv://akwasi:akwasi@cocoa-cluster.obrwdfi.mongodb.net/CocoaSystem?retryWrites=true&w=majority';
}

const db = mongoose.connect(URL, {
  connectTimeoutMS: 10000,
});

mongoose.connection.on('connected', () => {
  console.log('connected');
});

process.on('SIGINT', () => {
  mongoose.connection.close();
  console.log('disconnected');
});

module.exports = db;
