const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half-day'],
      required: true,
      default: 'Present',
    },
    clockIn: {
      type: String, // e.g. "09:00 AM"
    },
    clockOut: {
      type: String, // e.g. "05:00 PM"
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Attendance', AttendanceSchema);
