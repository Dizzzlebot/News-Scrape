var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Noteschema = new Schema({
    title: {
        type: String,
    },
    body: {
        type: String,
    }
});

var Notes = mongoose.model("Notes", Noteschema);
module.exports = Notes;