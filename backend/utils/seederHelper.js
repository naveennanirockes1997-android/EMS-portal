const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const seedData = async (silent = false) => {
  try {
    // Check if data already exists
    const employeeCount = await Employee.countDocuments({});
    if (employeeCount > 0) {
      if (!silent) console.log('Database already has data. Skipping seeding.');
      return;
    }

    if (!silent) console.log('Seeding initial data...');

    // 1. Seed Departments
    const depts = [
      { name: 'Human Resources', description: 'Handles recruitment, benefits, and employee relations.' },
      { name: 'Engineering', description: 'Responsible for software development and architecture.' },
      { name: 'Marketing', description: 'Handles advertising, brand strategy, and social media.' },
      { name: 'Finance', description: 'Manages budgets, payroll, and financial planning.' },
      { name: 'Sales', description: 'Drives client acquisition and revenue generation.' },
    ];
    
    const createdDepts = await Department.insertMany(depts);
    if (!silent) console.log('Departments Seeded!');

    // 2. Seed Admin & HR & Employees
    // Admin
    const admin = await Employee.create({
      name: 'System Admin',
      email: 'admin@ems.com',
      password: 'adminpassword123',
      role: 'admin',
      department: 'Management',
      salary: 120000,
      joiningDate: new Date('2024-01-15'),
      phone: '1234567890',
      designation: 'Chief Technology Officer',
    });

    // HR
    const hr = await Employee.create({
      name: 'Sarah HR',
      email: 'hr@ems.com',
      password: 'hrpassword123',
      role: 'hr',
      department: 'Human Resources',
      salary: 80000,
      joiningDate: new Date('2024-06-10'),
      phone: '9876543210',
      designation: 'HR Lead',
    });

    // Employees
    const emp1 = await Employee.create({
      name: 'John Doe',
      email: 'john@ems.com',
      password: 'employeepassword123',
      role: 'employee',
      department: 'Engineering',
      salary: 95000,
      joiningDate: new Date('2025-02-20'),
      phone: '5556667777',
      designation: 'Senior Developer',
    });

    const emp2 = await Employee.create({
      name: 'Jane Smith',
      email: 'jane@ems.com',
      password: 'employeepassword123',
      role: 'employee',
      department: 'Marketing',
      salary: 70000,
      joiningDate: new Date('2025-03-01'),
      phone: '1112223333',
      designation: 'Marketing Executive',
    });

    // Set Manager for Human Resources and Engineering
    createdDepts[0].manager = hr._id;
    await createdDepts[0].save();
    
    createdDepts[1].manager = emp1._id;
    await createdDepts[1].save();

    if (!silent) console.log('Employees & Managers Seeded!');

    // 3. Seed some attendance logs
    const today = new Date();
    
    // Yesterdays
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    // John Doe's yesterday
    await Attendance.create({
      employeeId: emp1._id,
      date: yesterday,
      status: 'Present',
      clockIn: '08:55 AM',
      clockOut: '05:05 PM',
    });

    // Jane Smith's yesterday
    await Attendance.create({
      employeeId: emp2._id,
      date: yesterday,
      status: 'Late',
      clockIn: '09:30 AM',
      clockOut: '05:00 PM',
    });

    // Today's check-ins (partial)
    await Attendance.create({
      employeeId: emp1._id,
      date: today,
      status: 'Present',
      clockIn: '08:45 AM',
    });

    if (!silent) console.log('Attendance Records Seeded!');

    // 4. Seed some leaves
    await Leave.create({
      employeeId: emp2._id,
      leaveType: 'Sick Leave',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-03'),
      reason: 'Recovering from wisdom teeth extraction surgery.',
      status: 'Pending',
    });

    await Leave.create({
      employeeId: emp1._id,
      leaveType: 'Casual Leave',
      startDate: new Date('2026-05-10'),
      endDate: new Date('2026-05-11'),
      reason: 'Family event out of town.',
      status: 'Approved',
      approvedBy: hr._id,
    });

    if (!silent) console.log('Leave Requests Seeded!');
    if (!silent) console.log('Database seeding complete!');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

module.exports = { seedData };
