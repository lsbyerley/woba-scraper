// Dependecies
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


// Sample User Schema
var UserSchema = new Schema({
	name: { type: String, trim: true, required: true },
	email: { type: String, unique: true, required: true, lowercase: true, trim: true },
	password: String,
	created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

// Sets the created_at parameter equal to the current time
UserSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

var User = mongoose.model('your-app-user', UserSchema);

module.exports = {
	User: User
}

// to load this from a controller use:
//var User = require("../server/models").User;
