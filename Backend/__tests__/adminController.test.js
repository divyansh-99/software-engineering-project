jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("bcrypt", () => ({ hash: jest.fn(), compare: jest.fn() }));

const db = require("../config/db");
const bcrypt = require("bcrypt");
const controller = require("../controllers/adminController");
const { mockReq, mockRes } = require("./helpers");

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("registerAdmin", () => {
  const body = { name: "Admin", email: "a@spms.com", password: "secret" };

  it("hashes the password and inserts the admin, returning 201", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) => cb(null, {}));

    const res = mockRes();
    await controller.registerAdmin(mockReq({ body }), res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO admins"),
      ["Admin", "a@spms.com", "a@spms.com", "hashed"],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin registered successfully"
    });
  });

  it("returns 400 on a duplicate email", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) =>
      cb({ code: "ER_DUP_ENTRY" })
    );

    const res = mockRes();
    await controller.registerAdmin(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin email already exists"
    });
  });

  it("returns 500 on a generic insert error", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) => cb({ code: "OTHER" }));

    const res = mockRes();
    await controller.registerAdmin(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin registration failed"
    });
  });

  it("returns 500 when hashing throws", async () => {
    bcrypt.hash.mockRejectedValue(new Error("hash"));

    const res = mockRes();
    await controller.registerAdmin(mockReq({ body }), res);

    expect(db.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

describe("loginAdmin", () => {
  it("logs in via the hardcoded fallback credentials without a db call", async () => {
    const res = mockRes();
    await controller.loginAdmin(
      mockReq({ body: { email: "admin@spms.com", password: "admin123" } }),
      res
    );

    expect(db.query).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      admin: { email: "admin@spms.com", name: "Placement Admin" }
    });
  });

  it("returns 401 when the db lookup errors", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    await controller.loginAdmin(
      mockReq({ body: { email: "x@spms.com", password: "p" } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid admin credentials"
    });
  });

  it("returns 401 when no admin matches", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(null, []));

    const res = mockRes();
    await controller.loginAdmin(
      mockReq({ body: { email: "x@spms.com", password: "p" } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 when the password does not match", async () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, [{ email: "x@spms.com", password: "hash" }])
    );
    bcrypt.compare.mockResolvedValue(false);

    const res = mockRes();
    await controller.loginAdmin(
      mockReq({ body: { email: "x@spms.com", password: "p" } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns admin details on a successful db login", async () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, [{ email: "x@spms.com", name: "Bob", password: "hash" }])
    );
    bcrypt.compare.mockResolvedValue(true);

    const res = mockRes();
    await controller.loginAdmin(
      mockReq({ body: { email: "x@spms.com", password: "p" } }),
      res
    );

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      admin: { email: "x@spms.com", name: "Bob" }
    });
  });
});

describe("getAllStudents", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getAllStudents(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to fetch students" });
  });

  it("returns the student rows", () => {
    const rows = [{ student_id: 1 }];
    db.query.mockImplementation((sql, cb) => cb(null, rows));

    const res = mockRes();
    controller.getAllStudents(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe("getAllJobs", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getAllJobs(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("returns the joined job rows", () => {
    const rows = [{ job_id: 1, company_name: "Acme" }];
    db.query.mockImplementation((sql, cb) => cb(null, rows));

    const res = mockRes();
    controller.getAllJobs(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe("getAllApplications", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getAllApplications(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch applications"
    });
  });

  it("returns the application rows", () => {
    const rows = [{ application_id: 1 }];
    db.query.mockImplementation((sql, cb) => cb(null, rows));

    const res = mockRes();
    controller.getAllApplications(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe("updateApplicationStatus", () => {
  const body = { application_id: 1, status: "Selected" };

  it("returns 500 when the update fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.updateApplicationStatus(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to update application status"
    });
  });

  it("updates the status and returns a success message", () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, { affectedRows: 1 })
    );

    const res = mockRes();
    controller.updateApplicationStatus(mockReq({ body }), res);

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      ["Selected", 1],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Application status updated successfully"
    });
  });
});

describe("getPlacementStats", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getPlacementStats(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch statistics"
    });
  });

  it("returns the first stats row", () => {
    const stats = {
      total_students: 10,
      total_jobs: 3,
      total_applications: 20,
      placed_students: 5
    };
    db.query.mockImplementation((sql, cb) => cb(null, [stats]));

    const res = mockRes();
    controller.getPlacementStats(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith(stats);
  });
});
