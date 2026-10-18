const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    first_name:      { type: String, required: true, trim: true, maxlength: 50 },
    last_name:       { type: String, required: true, trim: true, maxlength: 50 },
    email:           { type: String, required: true, trim: true, lowercase: true },
    position:        { type: String, required: true, trim: true, maxlength: 100 },
    salary:          { type: Number, required: true, min: 0.01 },
    date_of_joining: { type: Date, required: true },
    department:      { type: String, required: true, trim: true, maxlength: 100 },
    user: {
      type: mongoose.Schema.Types.ObjectId, // stores e.g. 6710a1b2c3...
      ref: 'User',                           // "this id points into the users collection"
      required: true,                        // an employee MUST have an owner
      index: true                            // fast lookups by owner
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Same employee email can exist under two different users, but not twice under one user
employeeSchema.index({ user: 1, email: 1 }, { unique: true });

employeeSchema.set('toJSON', { transform: (doc, ret) => { delete ret.__v; return ret; } });

module.exports = mongoose.model('Employee', employeeSchema);