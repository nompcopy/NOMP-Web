// UserModel.js
var cripto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var oAuthTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'];

// UserModelSchema
var UserModelSchema({
    name: {type: String, default: '', trim: true},
    email: {type: String, default: '', trim: true},
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

UserSchema.virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(passowrd)
    })
    .get(function() { return this._password });


/*
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
}

UserSchema.path('name').validate(function (name) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function (email) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function (email, fn) {
    var User = mongoose.model('User');
    if (this.doesNotRequireValidation()) {
        fn(true);
    }

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        User.find({ email: email }).exec(function (err, users) {
            fn(!err && users.length === 0);
        })
    }
    else {
        fn(true);
    }
}, 'Email already exists');

UserSchema.path('username').validate(function (username) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return username.length;
}, 'Username cannot be blank');

UserSchema.path('hashed_password').validate(function (hashed_password) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return hashed_password.length;
}, 'Password cannot be blank');


/*
 * Pre-save
 */
UserSchema.pre('save', function(next) {
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
UserSchema.methods = {
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
            return '';
        }
    },
    // Validation is not required if using oAuth
    doesNotRequireValidation: function() {
        return ~oAuthTypes.indexOf(this.provider);
    }
}

// Built and exports Model from Schema
mongoose.model('UserModel', UserModelSchema);
exports.UserModel = mongoose.model('UserModel');