const mongoose = require("mongoose");
const devDbURL = "mongodb+srv://oangsa:oangsa58528@dev.x91artd.mongodb.net/?retryWrites=true&w=majority";
const devDB = mongoose.createConnection(devDbURL);
const notesSchema = {
    name: String,
    studentId: String,
    class_num: String,
    total_days: Number,
    week_days: Number,
    allDates: Array,
    weekDates: Array,
    nweekDate: Array,
    ndates: Array,
    stats: String,
    reason: String
}

const devNote = devDB.model("DevRS", notesSchema);

module.exports = devNote;