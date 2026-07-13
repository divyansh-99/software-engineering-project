const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.registerStudent = async (req, res) => {
  const { name, email, password, roll_number, branch, cgpa } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO students
      (name, email, password, roll_number, branch, cgpa)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.promise().query(query, [
      name,
      email,
      hashedPassword,
      roll_number,
      branch,
      cgpa
    ]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Student email already exists" });
    }

    throw error;
  }

  return res.status(201).json({
    message: "Student registered successfully"
  });
};

exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  const [results] = await db.promise().query(
    "SELECT * FROM students WHERE email = ?",
    [email]
  );

  if (results.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const student = results[0];
  const isMatch = await bcrypt.compare(password, student.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return res.json({
    message: "Login successful",
    student: {
      id: student.student_id,
      name: student.name,
      email: student.email
    }
  });
};

exports.applyJob = async (req, res) => {
  const { student_id, job_id } = req.body;

  const [existingApplications] = await db.promise().query(
    "SELECT application_id FROM applications WHERE student_id = ? AND job_id = ?",
    [student_id, job_id]
  );

  if (existingApplications.length > 0) {
    return res.status(400).json({
      message: "You have already applied to this job"
    });
  }

  try {
    await db.promise().query(
      "INSERT INTO applications (student_id, job_id) VALUES (?, ?)",
      [student_id, job_id]
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "You have already applied to this job"
      });
    }

    throw error;
  }

  return res.status(201).json({
    message: "Job applied successfully"
  });
};

exports.getEligibleJobs = async (req, res) => {
  const { student_id } = req.params;

  const query = `
    SELECT jobs.*,
           applications.application_id,
           applications.status AS application_status
    FROM jobs
    LEFT JOIN applications
      ON jobs.job_id = applications.job_id
      AND applications.student_id = ?
    JOIN students ON students.student_id = ?
    WHERE students.cgpa >= jobs.min_cgpa
      AND students.branch = jobs.branch_allowed
  `;

  const [results] = await db.promise().query(query, [
    student_id,
    student_id
  ]);

  return res.json(results);
};

exports.getAppliedJobs = async (req, res) => {
  const { student_id } = req.params;

  const query = `
    SELECT jobs.title,
           jobs.package_lpa,
           applications.status,
           applications.applied_at
    FROM applications
    JOIN jobs ON applications.job_id = jobs.job_id
    WHERE applications.student_id = ?
  `;

  const [results] = await db.promise().query(query, [student_id]);
  return res.json(results);
};
