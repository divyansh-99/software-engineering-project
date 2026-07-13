jest.mock("../config/db", () => ({ query: jest.fn() }));
jest.mock("bcrypt", () => ({ hash: jest.fn(), compare: jest.fn() }));

const db = require("../config/db");
const bcrypt = require("bcrypt");
const controller = require("../controllers/companyController");
const { mockReq, mockRes } = require("./helpers");

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("registerCompany", () => {
  const body = {
    company_name: "Acme",
    contact_email: "hr@acme.com",
    password: "secret"
  };

  it("hashes the password and inserts the company, returning 201", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) => cb(null, {}));

    const res = mockRes();
    await controller.registerCompany(mockReq({ body }), res);

    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO companies"),
      ["Acme", "hr@acme.com", "hashed"],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Company registered successfully"
    });
  });

  it("returns 500 when the insert fails", async () => {
    bcrypt.hash.mockResolvedValue("hashed");
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    await controller.registerCompany(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Company registration failed"
    });
  });

  it("returns 500 when hashing throws", async () => {
    bcrypt.hash.mockRejectedValue(new Error("hash"));

    const res = mockRes();
    await controller.registerCompany(mockReq({ body }), res);

    expect(db.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

describe("loginCompany", () => {
  const body = { contact_email: "hr@acme.com", password: "secret" };

  it("returns 500 when the lookup query fails", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    await controller.loginCompany(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });

  it("returns 401 when no company matches", async () => {
    db.query.mockImplementation((sql, params, cb) => cb(null, []));

    const res = mockRes();
    await controller.loginCompany(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password"
    });
  });

  it("returns 401 when the password does not match", async () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, [{ company_id: 1, password: "hash" }])
    );
    bcrypt.compare.mockResolvedValue(false);

    const res = mockRes();
    await controller.loginCompany(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password"
    });
  });

  it("returns company details on a successful login", async () => {
    const company = {
      company_id: 3,
      company_name: "Acme",
      contact_email: "hr@acme.com",
      password: "hash"
    };
    db.query.mockImplementation((sql, params, cb) => cb(null, [company]));
    bcrypt.compare.mockResolvedValue(true);

    const res = mockRes();
    await controller.loginCompany(mockReq({ body }), res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      company: { id: 3, name: "Acme", email: "hr@acme.com" }
    });
  });
});

describe("postJob", () => {
  const body = {
    company_id: 1,
    title: "SWE",
    description: "desc",
    min_cgpa: 7,
    branch_allowed: "CSE",
    package_lpa: 12,
    deadline: "2026-01-01"
  };

  it("inserts the job and returns 201", () => {
    db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 1 }));

    const res = mockRes();
    controller.postJob(mockReq({ body }), res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO jobs"),
      [1, "SWE", "desc", 7, "CSE", 12, "2026-01-01"],
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Job posted successfully" });
  });

  it("returns 500 when the insert fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.postJob(mockReq({ body }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Job posting failed" });
  });
});

describe("getCompanyJobs", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getCompanyJobs(mockReq({ params: { company_id: "1" } }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch company jobs"
    });
  });

  it("returns the job rows for the company", () => {
    const rows = [{ job_id: 1 }];
    db.query.mockImplementation((sql, params, cb) => cb(null, rows));

    const res = mockRes();
    controller.getCompanyJobs(mockReq({ params: { company_id: "5" } }), res);

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      ["5"],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe("getCompanyApplications", () => {
  it("returns 500 when the query fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.getCompanyApplications(
      mockReq({ params: { company_id: "1" } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to fetch applications"
    });
  });

  it("returns the application rows", () => {
    const rows = [{ application_id: 1 }];
    db.query.mockImplementation((sql, params, cb) => cb(null, rows));

    const res = mockRes();
    controller.getCompanyApplications(
      mockReq({ params: { company_id: "2" } }),
      res
    );

    expect(res.json).toHaveBeenCalledWith(rows);
  });
});

describe("updateCompanyApplicationStatus", () => {
  it("returns 400 for an invalid status", () => {
    const res = mockRes();
    controller.updateCompanyApplicationStatus(
      mockReq({ body: { company_id: 1, application_id: 1, status: "Unknown" } }),
      res
    );

    expect(db.query).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid application status"
    });
  });

  it("maps 'Accepted' to 'Selected' and updates the row", () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, { affectedRows: 1 })
    );

    const res = mockRes();
    controller.updateCompanyApplicationStatus(
      mockReq({ body: { company_id: 1, application_id: 9, status: "Accepted" } }),
      res
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      ["Selected", 9, 1],
      expect.any(Function)
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Application accepted successfully"
    });
  });

  it("returns 500 when the update query fails", () => {
    db.query.mockImplementation((sql, params, cb) => cb(new Error("db")));

    const res = mockRes();
    controller.updateCompanyApplicationStatus(
      mockReq({ body: { company_id: 1, application_id: 9, status: "Rejected" } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to update application status"
    });
  });

  it("returns 404 when no matching application is found", () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, { affectedRows: 0 })
    );

    const res = mockRes();
    controller.updateCompanyApplicationStatus(
      mockReq({ body: { company_id: 1, application_id: 9, status: "Pending" } }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Application not found for this company"
    });
  });
});
