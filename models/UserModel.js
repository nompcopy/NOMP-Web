// UserModel.js
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var oAuthTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'];

// UserModelSchema
var UserModelSchema = new Schema({
    name: {type: String, default: '', trim: true},
    email: {type: String, default: '', trim: true},
    actor_type: {type: Schema.ObjectId, ref: 'actor_source_type'},
    actor_type_name: {type: String},
    provider: {type: String, default: ''},
    username: {type: String, default: '', trim: true},
    hashed_password: {type: String, default: ''},
    salt: {type: String, default: ''},
    authToken: {type: String, default: ''},
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {}
});


UserModelSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password)
    })
    .get(function() { return this._password });


/*
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
}

UserModelSchema.path('name').validate(function (name) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return name.length;
}, 'Name cannot be blank');

UserModelSchema.path('email').validate(function (email) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return email.length;
}, 'Email cannot be blank');

UserModelSchema.path('email').validate(function (email, fn) {
    var UserModel = mongoose.model('UserModel');
    if (this.doesNotRequireValidation()) {
        fn(true);
    }

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        UserModel.find({ email: email }).exec(function (err, users) {
            fn(!err && users.length === 0);
        })
    }
    else {
        fn(true);
    }
}, 'Email already exists');

UserModelSchema.path('username').validate(function (username) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return username.length;
}, 'Username cannot be blank');

UserModelSchema.path('hashed_password').validate(function (hashed_password) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return hashed_password.length;
}, 'Password cannot be blank');

UserModelSchema.path('actor_type').validate(function (actor_type) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return actor_type.length;
}, 'Identity cannot be blank');
/*
 * Pre-save
 */
UserModelSchema.pre('save', function(next) {
    if (!this.isNew) {
        return next();
    }

    if (!validatePresenceOf(this.password)
        && !this.doesNotRequireValidation()) {
        next(new Error('Invalid password'))
    }
    else {
        next();
    }
});


/*
 * Methods
 */
UserModelSchema.methods = {
    // Authenticate
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    // Make salt
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    // encrypt password
    encryptPassword: function(password) {
        if (!password) {
            return '';
        }
        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch(err) {
            console.log(err);
            return '';
        }
    },
    // data = {name: String, description: String, actor_type: ObjectId}
    update: function(data, cb) {
        for (property in data) {
            this[property] = data[property];
        }
        // this.keywords = generateKeyWords(this.name);
        this.save(cb);
    },
    // Validation is not required if using oAuth
    doesNotRequireValidation: function() {
        return ~oAuthTypes.indexOf(this.provider);
    }
}

// Built and exports Model from Schema
mongoose.model('UserModel', UserModelSchema);
exports.UserModel = mongoose.model('UserModel');