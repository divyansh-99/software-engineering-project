const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.registerCompany = async (req, res) => {

  const { company_name, contact_email, password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO companies
      (company_name, contact_email, password)
      VALUES (?, ?, ?)
    `;

    db.query(query, [company_name, contact_email, hashedPassword], (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Company registration failed" });
      }

      res.status(201).json({
        message: "Company registered successfully"
      });

    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


exports.loginCompany = (req, res) => {

  const { contact_email, password } = req.body;

  const query = "SELECT * FROM companies WHERE contact_email = ?";

  db.query(query, [contact_email], async (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const company = results[0];

    const isMatch = await bcrypt.compare(password, company.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      company: {
        id: company.company_id,
        name: company.company_name,
        email: company.contact_email
      }
    });

  });

};


exports.postJob = (req, res) => {

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

  db.query(
    query,
    [company_id, title, description, min_cgpa, branch_allowed, package_lpa, deadline],
    (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Job posting failed" });
      }

      res.status(201).json({
        message: "Job posted successfully"
      });

    }
  );

};

exports.getCompanyJobs = (req, res) => {

  const { company_id } = req.params;

  const query = `
    SELECT job_id, title, description, min_cgpa, branch_allowed, package_lpa, deadline
    FROM jobs
    WHERE company_id = ?
    ORDER BY job_id DESC
  `;

  db.query(query, [company_id], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch company jobs" });
    }

    res.json(results);

  });

};

exports.getCompanyApplications = (req, res) => {

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

  db.query(query, [company_id], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch applications" });
    }

    res.json(results);

  });

};

exports.updateCompanyApplicationStatus = (req, res) => {

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

  db.query(query, [normalizedStatus, application_id, company_id], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update application status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found for this company" });
    }

    res.json({ message: `Application ${status.toLowerCase()} successfully` });

  });

};
