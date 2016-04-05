var mongoose = require('mongoose');
var schema = mongoose.Schema;

var gameSchema = new schema({
    username: String,
    email: String,
    score: Number,
    time: Number,
    tries: Number
});

mongoose.model('gameusers', gameSchema);