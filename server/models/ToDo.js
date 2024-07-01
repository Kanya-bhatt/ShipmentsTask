const mongoose = require('mongoose')

const { Schema } = mongoose;

const ToDoSchema = new Schema({
    task: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['pending','completed'], // Example status options
        default: 'pending'

    },
    deadline: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('ToDo', ToDoSchema)