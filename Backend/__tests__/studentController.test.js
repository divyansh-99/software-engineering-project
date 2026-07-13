jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("bcrypt", () => ({ hash: jest.fn(), compare: jest.fn() }));

const db = require("../config/db");
const bcrypt = require("bcrypt");
const controller = require("../controllers/studentController");
const { mockReq, mockRes } = require("./helpers");

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("registerStudent", () => {
  const body = {
    name: "Alice",
    email: "alice@test.com",
    password: "secret",
    roll_number: "R1",
    branch: "CSE",
    cgpa: 8.5
  };

  it("hashes the password and inserts the student, returning 201", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 1 }));

    const req = mockReq({ body });
    const res = mockRes();

    await controller.registerStudent(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO students"),
      ["Alice", "alice@test.com", "hashed", "R1", "CSE", 8.5],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student registered successfully"
    });
  });

  it("returns 500 when the insert query fails", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db down")));

    const res = mockRes();
    await controller.registerStudent(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Registration failed" });
  });

  it("returns 500 when hashing throws", async () => {
    bcrypt.hash.mockRejectedValue(new Error("hash error"));

    const res = mockRes();
    await controller.registerStudent(mockReq({ body }), res);

    expect(db.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

describe("loginStudent", () => {
  const body = { email: "alice@test.com", password: "secret" };

  it("returns 500 when the lookup query fails", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    await controller.loginStudent(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("returns 401 when no student matches the email", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(null, []));

    const res = mockRes();
    await controller.loginStudent(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password"
    });
  });

  it("returns 401 when the password does not match", async () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, [{ student_id: 1, password: "hash" }])
    );
    bcrypt.compare.mockResolvedValue(false);

    const res = mockRes();
    await controller.loginStudent(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password"
    });
  });

  it("returns student details on a successful login", async () => {
    const student = {
      student_id: 7,
      name: "Alice",
      email: "alice@test.com",
      password: "hash"
    };
    db.query.mockImplementation((sql, params, cb) => cb(null, [student]));
    bcrypt.compare.mockResolvedValue(true);

    const res = mockRes();
    await controller.loginStudent(mockReq({ body }), res);

    expect(bcrypt.compare).toHaveBeenCalledWith("secret", "hash");
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      student: { id: 7, name: "Alice", email: "alice@test.com" }
    });
  });
});

describe("applyJob", () => {
  const body = { student_id: 1, job_id: 2 };

  it("returns 500 when the duplicate-check query fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.applyJob(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("returns 400 when the student already applied", () => {
    db.query.mockImplementation((sql, params, cb) => cb(null, [{ id: 1 }]));

    const res = mockRes();
    controller.applyJob(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "You have already applied to this job"
    });
  });

  it("returns 500 when the insert fails", () => {
    db.query
      .mockImplementationOnce((sql, params, cb) => cb(null, []))
      .mockImplementationOnce((sql, params, cb) => cb(new Error("insert")));

    const res = mockRes();
    controller.applyJob(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Application failed" });
  });

  it("returns 201 on a successful application", () => {
    db.query
      .mockImplementationOnce((sql, params, cb) => cb(null, []))
      .mockImplementationOnce((sql, params, cb) => cb(null, { insertId: 5 }));

    const res = mockRes();
    controller.applyJob(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Job applied successfully"
    });
  });
});

describe("getEligibleJobs", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getEligibleJobs(mockReq({ params: { student_id: "1" } }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("passes the student_id twice and returns the rows", () => {
    const rows = [{ job_id: 1 }];
    db.query.mockImplementation((sql, params, cb) => cb(null, rows));

    const res = mockRes();
    controller.getEligibleJobs(mockReq({ params: { student_id: "9" } }), res);

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      ["9", "9"],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe("getAppliedJobs", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getAppliedJobs(mockReq({ params: { student_id: "1" } }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch applied jobs"
    });
  });

  it("returns the applied jobs rows", () => {
    const rows = [{ title: "SWE" }];
    db.query.mockImplementation((sql, params, cb) => cb(null, rows));

    const res = mockRes();
    controller.getAppliedJobs(mockReq({ params: { student_id: "3" } }), res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });
});
