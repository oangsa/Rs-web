const mongoose = require("mongoose");
const dbURL = "mongodb+srv://oangsa:oangsa58528@cluster0.q9lfhle.mongodb.net/?retryWrites=true&w=majority";
const prodDB = mongoose.createConnection(dbURL);
const Schema = {
    name: String,
    studentId: String,
    class_num: String,
    token: String
}
const Data = prodDB.model("Data", Schema);


module.exports = Data;