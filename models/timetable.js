

const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema ({
    username: String,
    table: [String]
});

module.exports = mongoose.model('Timetable', timetableSchema);