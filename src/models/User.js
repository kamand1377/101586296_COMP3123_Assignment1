const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false } // select:false = NOT returned by queries unless asked
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } } // auto-managed dates
);

// "pre save hook": runs automatically right before a user is saved
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;        // don't re-hash an already-hashed password
  this.password = await bcrypt.hash(this.password, 10); // 10 = salt rounds (cost)
  // "Hello123!" becomes something like "$2a$10$Xk3..." (60 chars)
});

// Instance method: user.comparePassword('typed') -> true/false
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Whenever a user is turned into JSON, strip the password just in case
userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; }
});

module.exports = mongoose.model('User', userSchema); // collection name becomes "users"