const mongoose = require("mongoose");
const dbURL = "mongodb+srv://oangsa:oangsa58528@cluster0.q9lfhle.mongodb.net/?retryWrites=true&w=majority";
const prodDB = mongoose.createConnection(dbURL);

const notesSchema = {
    name: String,
    studentId: String,
    class_num: String,
    class: String,
    total_days: Number,
    week_days: Number,
    allDates: Array,
    weekDates: Array,
    nweekDate: Array,
    ndates: Array,
    stats: String,
    reason: String
}

const Note = prodDB.model("RS", notesSchema);

module.exports = Note