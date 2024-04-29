const Datastore = require("nedb");
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * UserDAO class for managing user data.
 */
class UserDAO {
    /**
     * Create a new UserDAO instance.
     * @param {string} dbFilePath - The file path for the database.
     */
    constructor(dbFilePath) {
        if (dbFilePath) {
            // Embedded database
            this.db = new Datastore({ filename: dbFilePath, autoload: true });
        } else {
            // In-memory database
            this.db = new Datastore();
        }
    }

    /**
     * Initialize the UserDAO with sample data.
     * @returns {UserDAO} The UserDAO instance.
     */
    init() {
        this.db.insert([
            {
                user: 'user',
                password: '$2b$10$z/rzS.a7bFqVKKgSDVeeluqsboX38Xd6j/V6egs31aZLZ7iKi7nFC',
                isAdmin: false
            },
            {
                user: 'admin',
                password: '$2b$10$xOgyG.AwOo4A0O0fjHDHtufMD5O1aZaMdk4qgg6/gAWD9yDRj12em',
                isAdmin: true
            }
        ], function (err) {
            if (err) {
                console.error('Error inserting sample data:', err);
            } else {
                console.log('Sample data inserted into the user database.');
            }
        });
        return this;
    }

    /**
     * Create a new user.
     * @param {string} username - The username.
     * @param {string} password - The password.
     * @param {boolean} isAdmin - Whether the user is an admin or not.
     */
    create(username, password, isAdmin = false) {
        bcrypt.hash(password, saltRounds).then((hash) => {
            var entry = {
                user: username,
                password: hash,
                isAdmin: isAdmin
            };
            this.db.insert(entry, function (err) {
                if (err) {
                    console.log("Can't insert user:", username);
                }
            });
        });
    }

    /**
     * Lookup a user by username.
     * @param {string} user - The username to look up.
     * @param {function} cb - Callback function.
     */
    lookup(user, cb) {
        this.db.find({ 'user': user }, function (err, entries) {
            if (err) {
                return cb(null, null);
            } else {
                if (entries.length === 0) {
                    return cb(null, null);
                }
                return cb(null, entries[0]);
            }
        });
    }

    /**
     * Get all users.
     * @returns {Promise} A promise that resolves with an array of users.
     */
    getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, docs) => {
                if (err) {
                    console.error("Error fetching users from DB:", err);
                    reject(err);
                } else {
                    console.log("Fetched users:", docs);
                    resolve(docs);
                }
            });
        });
    }

    /**
     * Delete a user by userId.
     * @param {string} userId - The ID of the user to delete.
     * @param {function} cb - Callback function.
     */
    deleteUser(userId, cb) {
        this.db.remove({ _id: userId }, {}, cb);
    }

    /**
     * Update a user.
     * @param {string} userId - The ID of the user to update.
     * @param {object} newDetails - The new details for the user.
     * @param {function} cb - Callback function.
     */
    updateUser(userId, newDetails, cb) {
        if (newDetails.password) {
            bcrypt.hash(newDetails.password, saltRounds, (err, hash) => {
                if (err) return cb(err);
                newDetails.password = hash;
                this.db.update({ _id: userId }, { $set: newDetails }, {}, cb);
            });
        } else {
            this.db.update({ _id: userId }, { $set: newDetails }, {}, cb);
        }
    }
}

const dao = new UserDAO();
dao.init();

module.exports = dao;
