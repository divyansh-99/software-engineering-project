const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.registerStudent = async (req, res) => {
    const { name, email, password, roll_number, branch, cgpa } = req.body;

    try {

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
        INSERT INTO students 
        (name, email, password, roll_number, branch, cgpa)
        VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [name, email, hashedPassword, roll_number, branch, cgpa],
            (err, result) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Registration failed" });
                }

                res.status(201).json({
                    message: "Student registered successfully"
                });
            }
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.loginStudent = (req, res) => {

  const { email, password } = req.body;

  const query = "SELECT * FROM students WHERE email = ?";

  db.query(query, [email], async (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      console.log("No user found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const student = results[0];

    console.log("Entered password:", password);
    console.log("Stored hash:", student.password);

    const bcrypt = require("bcrypt");

    const isMatch = await bcrypt.compare(password, student.password);

    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      student: {
        id: student.student_id,
        name: student.name,
        email: student.email
      }
    });

  });

};


exports.applyJob = (req, res) => {

  const { student_id, job_id } = req.body;

  const checkQuery = `
  SELECT * FROM applications
  WHERE student_id = ? AND job_id = ?
  `;

  db.query(checkQuery, [student_id, job_id], (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: "You have already applied to this job"
      });
    }

    const insertQuery = `
    INSERT INTO applications (student_id, job_id)
    VALUES (?, ?)
    `;

    db.query(insertQuery, [student_id, job_id], (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Application failed" });
      }

      res.status(201).json({
        message: "Job applied successfully"
      });

    });

  });

};

exports.getEligibleJobs = (req, res) => {

const student_id = req.params.student_id;

const query = `
SELECT jobs.*,
applications.application_id

FROM jobs

LEFT JOIN applications
ON jobs.job_id = applications.job_id
AND applications.student_id = ?

JOIN students
ON students.student_id = ?

WHERE students.cgpa >= jobs.min_cgpa
AND students.branch = jobs.branch_allowed
`;

db.query(query,[student_id,student_id],(err,results)=>{

if(err){
console.error(err);
return res.status(500).json({message:"Server error"});
}

res.json(results);

});

};


exports.getAppliedJobs = (req, res) => {

const student_id = req.params.student_id;

const query = `
SELECT jobs.title,
jobs.package_lpa,
applications.status,
applications.applied_at

FROM applications
JOIN jobs ON applications.job_id = jobs.job_id

WHERE applications.student_id = ?
`;

db.query(query, [student_id], (err, results) => {

if(err){
console.error(err);
return res.status(500).json({message:"Failed to fetch applied jobs"});
}

res.json(results);

});

};




















/*without password matching
exports.loginStudent = async (req, res) => {

  const { email, password } = req.body;

  const query = "SELECT * FROM students WHERE email = ?";

  db.query(query, [email], async (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const student = results[0];

    const bcrypt = require("bcrypt");

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      student: {
        id: student.student_id,
        name: student.name,
        email: student.email
      }
    });

  });

};*/