COMP3123 Assignment 1 – Secure Employee Management API

A secure RESTful backend API built with Node.js, Express and MongoDB. Users sign up, log in to receive a JWT, and manage their own employees. Each user can only see and manage the employees they created.

Deployed API: https://101586296-comp-3123-assignment1.vercel.app Health check: https://101586296-comp-3123-assignment1.vercel.app/health

1. Technologies
Area	Technology
Runtime / framework	Node.js, Express
Database	MongoDB Atlas, Mongoose (database: comp3123_assignment1)
Authentication	JSON Web Tokens (jsonwebtoken)
Password hashing	bcryptjs
Validation	express-validator
Security	helmet, express-rate-limit
Logging	winston
Configuration	dotenv
Testing	Postman
Hosting	Vercel
2. Project Structure
├── app.js                  # Builds the Express app (middleware, routes, error handling)
├── server.js               # Connects to MongoDB and starts the server locally
├── src/
│   ├── config/             # db.js (MongoDB connection), logger.js (Winston)
│   ├── controllers/        # user.controller.js, employee.controller.js
│   ├── middleware/         # auth.js, errorHandler.js, rateLimiter.js, requestLogger.js, validate.js
│   ├── models/             # User.js, Employee.js
│   ├── routes/             # user.routes.js, employee.routes.js
│   ├── services/           # token.service.js (JWT sign/verify)
│   ├── utils/              # AppError.js, asyncHandler.js
│   └── validators/         # user.validators.js, employee.validators.js
├── logs/                   # Local log files (sample.log committed as evidence)
├── postman/                # Exported Postman collection
├── .env.example
└── README.md

Request flow:

Request → Helmet → JSON parser → Request logger → Rate limiter
        → Validation → JWT authentication → Controller (ownership check) → MongoDB
        → Errors go to the centralized error handler
3. Installation
bash
# 1. Clone
git clone https://github.com/kamand1377/101586296_COMP3123_Assignment1.git
cd 101586296_COMP3123_Assignment1

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env with your own values

# 4. Start the server (development, auto-restart)
npm run dev
# or
npm start

MongoDB: the app uses MongoDB Atlas. Create a free cluster, a database user, allow network access, and put the connection string (with /comp3123_assignment1 as the database name) in MONGODB_URI. The database and collections are created automatically on the first signup.

Testing: import postman/COMP3123_Assignment1.postman_collection.json into Postman. The server runs on http://localhost:3000.

4. Configuration
Variable	Description	Example
PORT	Local server port	3000
MONGODB_URI	MongoDB Atlas connection string	mongodb+srv://<user>:<password>@<cluster>.mongodb.net/comp3123_assignment1
JWT_SECRET	Secret used to sign JWTs	long random string
JWT_EXPIRES_IN	Token lifetime	1h
NODE_ENV	Environment	development

The real .env is not committed (listed in .gitignore). .env.example contains placeholder values only.

5. API Endpoints

Base paths: /api/v1/user and /api/v1/emp

#	Method	Endpoint	Auth	Success	Purpose
1	POST	/api/v1/user/signup	No	201	Register a new user
2	POST	/api/v1/user/login	No	200	Log in with username or email; returns a JWT
3	GET	/api/v1/emp/employees	Yes	200	List the authenticated user's employees
4	POST	/api/v1/emp/employees	Yes	201	Create an employee for the authenticated user
5	GET	/api/v1/emp/employees/{eid}	Yes	200	Get one of the user's employees
6	PUT	/api/v1/emp/employees/{eid}	Yes	200	Update one of the user's employees
7	DELETE	/api/v1/emp/employees?eid=xxx	Yes	204	Delete one of the user's employees
–	GET	/health	No	200	Health check
Example: signup
json
POST /api/v1/user/signup
{ "username": "alice", "email": "alice@test.com", "password": "Passw0rd!" }
Example: create employee
json
POST /api/v1/emp/employees
Authorization: Bearer <jwt>
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "position": "Developer",
  "salary": 65000,
  "date_of_joining": "2026-01-15",
  "department": "IT"
}
Error response format (all errors)
json
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "Invalid email format" } ] }
6. Authentication
Signup – the user registers with username, email and password. The password is hashed with bcrypt before saving.
Login – the user sends username + password or email + password. If correct, the server returns a JWT signed with JWT_SECRET, containing the user's id and an expiry (1 hour).
Authorization header – the client sends the token on every employee request:
   Authorization: Bearer <jwt>
Protected endpoints – all /api/v1/emp routes use the auth middleware, which:
rejects a missing token → 401
rejects an invalid or tampered token → 401
rejects an expired token → 401
rejects a token whose user no longer exists → 401
otherwise sets req.user to the authenticated user
7. Authorization (Employee Ownership)
Each employee has a user field: an ObjectId reference to the User who created it (one user → many employees).
The owner is always taken from the verified JWT (req.user.id), never from the request body, URL or query string. matchedData() from express-validator also strips any client-supplied user field.
List: Employee.find({ user: req.user.id }) – users only ever receive their own employees.
Get / update / delete: the employee is loaded and its owner compared with req.user.id:
employee does not exist → 404 Not Found
employee belongs to another user → 403 Forbidden
update and delete queries also include { _id: eid, user: req.user.id }
Changing eid in the URL or query string therefore cannot reach another user's data. This was tested with two users (alice and bob) in both directions.
8. Security
Feature	Implementation
Password hashing	bcrypt (10 salt rounds) in a Mongoose pre-save hook. The password field uses select: false and is removed in toJSON, so it is never returned.
JWT	Signed with JWT_SECRET, expires after JWT_EXPIRES_IN. Verified on every protected request.
Helmet	Adds security headers (Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security, X-Frame-Options) and removes X-Powered-By.
Rate limiting	Limits how many requests one IP can make in a time window, to slow down brute-force login attempts and spam. POST /signup and POST /login: 5 requests per 15 minutes. All /api routes: 100 requests per 15 minutes. When exceeded, the API returns 429 Too Many Requests with a JSON error, and the event is logged.
Input validation	express-validator checks required fields, string lengths, email format, positive numeric salary, ISO dates and valid MongoDB ObjectIds. Invalid input returns 400 with a list of field errors. Request bodies are limited to 10 KB.
Environment variables	Secrets (MONGODB_URI, JWT_SECRET) are read from .env locally and from Vercel environment variables in production. No secrets are committed.
Error handling	A centralized error handler returns consistent JSON. Unexpected errors return a generic 500 message; stack traces are written only to the log file.
HTTP status codes used
Code	When
200	Successful login, GET, PUT
201	User or employee created
204	Employee deleted (no body)
400	Validation failed, invalid ObjectId, malformed JSON
401	Missing, invalid or expired token; invalid credentials
403	Employee belongs to another user
404	Employee or route not found
409	Username or email already exists
429	Rate limit exceeded
500	Unexpected server error
9. Logging
Implemented with Winston, in JSON format with timestamps.
Location: logs/app.log (all events) and logs/error.log (errors only). These generated files are ignored by Git; logs/sample.log is committed as an example. On Vercel, logs go to the console (Vercel Logs tab) because the file system is read-only.
Logged: server startup, every HTTP request (method, path, status, duration, user id), signup and login success/failure, validation failures (field names only), authentication failures, ownership (authorization) failures, rate-limit events, and application errors.
Never logged: passwords, request bodies, JWT tokens or the Authorization header, JWT_SECRET, database credentials.
10. Health Check
GET /health

Example response (200):

json
{
  "status": "ok",
  "database": "connected",
  "uptime": 152.4,
  "timestamp": "2026-10-17T23:50:00.000Z"
}

If MongoDB is disconnected, it returns 503 with "status": "degraded".

11. Test Credentials (for marking only)
User	Username	Email	Password
User A	alice	alice@test.com	Passw0rd!
User B	bob	bob@test.com	Passw0rd!