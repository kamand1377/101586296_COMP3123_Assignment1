const { matchedData } = require('express-validator');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

// Helper: find an employee and make sure it belongs to this user
// - doesn't exist      -> 404
// - exists, not yours  -> 403
async function findOwned(eid, userId) {
  const emp = await Employee.findById(eid);
  if (!emp) throw new AppError('Employee not found', 404);
  if (emp.user.toString() !== userId) {
    logger.warn('Authorization failed: not owner', { userId, eid });
    throw new AppError('You do not have access to this employee', 403);
  }
  return emp;
}

// GET /employees -> only MY employees
exports.list = asyncHandler(async (req, res) => {
  const employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 });
  res.status(200).json({ success: true, count: employees.length, employees });
});

// POST /employees -> owner comes from the token, never from the body
exports.create = asyncHandler(async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const employee = await Employee.create({ ...data, user: req.user.id });
  logger.info('Employee created', { userId: req.user.id, eid: employee._id });
  res.status(201).json({ success: true, message: 'Employee created', employee });
});

// GET /employees/:eid
exports.getOne = asyncHandler(async (req, res) => {
  const employee = await findOwned(req.params.eid, req.user.id);
  res.status(200).json({ success: true, employee });
});

// PUT /employees/:eid
exports.update = asyncHandler(async (req, res) => {
  await findOwned(req.params.eid, req.user.id);
  const data = matchedData(req, { locations: ['body'] });
  if (Object.keys(data).length === 0) throw new AppError('No valid fields to update', 400);

  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.eid, user: req.user.id },
    data,
    { new: true, runValidators: true }
  );
  logger.info('Employee updated', { userId: req.user.id, eid: employee._id });
  res.status(200).json({ success: true, message: 'Employee updated', employee });
});

// DELETE /employees?eid=...
exports.remove = asyncHandler(async (req, res) => {
  const eid = req.query.eid;                      // from the query string, not the URL path
  await findOwned(eid, req.user.id);              // 404 or 403 decided here
  await Employee.deleteOne({ _id: eid, user: req.user.id });
  logger.info('Employee deleted', { userId: req.user.id, eid });
  res.status(204).send();                         // 204 = success, no body
});