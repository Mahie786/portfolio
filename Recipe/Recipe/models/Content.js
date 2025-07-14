const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const ReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number
});

const ContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  ingredients: [String],
  instructions: String,
  imagePath: String,
  comments: [CommentSchema],
  reviews: [ReviewSchema]
});

module.exports = mongoose.model('Content', ContentSchema);


// const mongoose = require('mongoose');

// const CommentSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     text: String,
//     createdAt: { type: Date, default: Date.now }
// });

// const ReviewSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     rating: Number
// });

// const ContentSchema = new mongoose.Schema({
//   userId: mongoose.Schema.Types.ObjectId,
//   title: String,
//   ingredients: [String],
//   instructions: String,
//   imagePath: String
// });

// module.exports = mongoose.model('Content', ContentSchema);
