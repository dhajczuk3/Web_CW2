const Datastore = require('nedb');

/**
 * MessageModel class for managing messages.
 */
class MessageModel {
    /**
     * Create a new MessageModel instance.
     * @param {string} dbFilePath - The file path for the database.
     */
    constructor(dbFilePath = 'messages.db') {
        this.messageDB = new Datastore({ filename: dbFilePath, autoload: true });
    }

    /**
     * Insert a new message into the database.
     * @param {object} message - The message object to insert.
     * @returns {Promise} A promise that resolves with the newly inserted message.
     */
    insertMessage(message) {
        return new Promise((resolve, reject) => {
            this.messageDB.insert(message, (err, newMessage) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(newMessage);
                }
            });
        });
    }

    /**
     * Get the 10 newest messages from the database.
     * @returns {Promise} A promise that resolves with an array of messages.
     */
    getAllMessages() {
        return new Promise((resolve, reject) => {
            this.messageDB.find({})
                .sort({ createdAt: -1 })
                .limit(10)
                .exec((err, messages) => {
                    if (err) {
                        console.error("Error fetching messages:", err);
                        reject(err);
                    } else {
                        console.log("Fetched messages:", messages);
                        resolve(messages);
                    }
                });
        });
    }
}

module.exports = new MessageModel(); // Exporting an instance for ease of use across the application
