const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.registerCompany = async (req, res) => {
  const { company_name, contact_email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO companies (company_name, contact_email, password)
    VALUES (?, ?, ?)
  `;

  try {
    await db.promise().query(query, [
      company_name,
      contact_email,
      hashedPassword
    ]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Company email already exists" });
    }

    throw error;
  }

  return res.status(201).json({
    message: "Company registered successfully"
  });
};

exports.loginCompany = async (req, res) => {
  const { contact_email, password } = req.body;

  const [results] = await db.promise().query(
    "SELECT * FROM companies WHERE contact_email = ?",
    [contact_email]
  );

  if (results.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const company = results[0];
  const isMatch = await bcrypt.compare(password, company.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return res.json({
    message: "Login successful",
    company: {
      id: company.company_id,
      name: company.company_name,
      email: company.contact_email
    }
  });
};

exports.postJob = async (req, res) => {
  const {
    company_id,
    title,
    description,
    min_cgpa,
    branch_allowed,
    package_lpa,
    deadline
  } = req.body;

  const query = `
    INSERT INTO jobs
      (company_id, title, description, min_cgpa, branch_allowed, package_lpa, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await db.promise().query(query, [
    company_id,
    title,
    description,
    min_cgpa,
    branch_allowed,
    package_lpa,
    deadline
  ]);

  return res.status(201).json({
    message: "Job posted successfully"
  });
};

exports.getCompanyJobs = async (req, res) => {
  const { company_id } = req.params;

  const query = `
    SELECT job_id, title, description, min_cgpa, branch_allowed, package_lpa, deadline
    FROM jobs
    WHERE company_id = ?
    ORDER BY job_id DESC
  `;

  const [results] = await db.promise().query(query, [company_id]);
  return res.json(results);
};

exports.getCompanyApplications = async (req, res) => {
  const { company_id } = req.params;

  const query = `
    SELECT
      applications.application_id,
      applications.status,
      applications.applied_at,
      jobs.job_id,
      jobs.title AS job_title,
      students.student_id,
      students.name AS student_name,
      students.email AS student_email,
      students.roll_number,
      students.branch,
      students.cgpa
    FROM applications
    JOIN jobs ON applications.job_id = jobs.job_id
    JOIN students ON applications.student_id = students.student_id
    WHERE jobs.company_id = ?
    ORDER BY applications.applied_at DESC
  `;

  const [results] = await db.promise().query(query, [company_id]);
  return res.json(results);
};

exports.updateCompanyApplicationStatus = async (req, res) => {
  const { company_id, application_id, status } = req.body;

  const statusMap = {
    Accepted: "Selected",
    Selected: "Selected",
    Rejected: "Rejected",
    Pending: "Applied",
    Applied: "Applied"
  };

  const normalizedStatus = statusMap[status];

  if (!normalizedStatus) {
    return res.status(400).json({ message: "Invalid application status" });
  }

  const query = `
    UPDATE applications
    JOIN jobs ON applications.job_id = jobs.job_id
    SET applications.status = ?
    WHERE applications.application_id = ?
      AND jobs.company_id = ?
  `;

  const [result] = await db.promise().query(query, [
    normalizedStatus,
    application_id,
    company_id
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      message: "Application not found for this company"
    });
  }

  return res.json({
    message: `Application ${status.toLowerCase()} successfully`
  });
};
