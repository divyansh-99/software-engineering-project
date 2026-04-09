(function () {
  const STORAGE_KEY = "spms_demo_store_v2";
  const useDemo = window.location.protocol !== "file:";

  function seedStore() {
    return {
      counters: {
        student: 1,
        company: 1,
        admin: 1,
        job: 1,
        application: 1
      },
      students: [],
      companies: [],
      admins: [],
      jobs: [],
      applications: []
    };
  }

  function getStore() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const seeded = seedStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(existing);
  }

  function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function nextId(store, key) {
    const value = store.counters[key];
    store.counters[key] += 1;
    return value;
  }

  function splitBranches(branchAllowed) {
    return String(branchAllowed || "")
      .split(",")
      .map((branch) => branch.trim().toUpperCase())
      .filter(Boolean);
  }

  function branchMatches(studentBranch, branchAllowed) {
    const allowed = splitBranches(branchAllowed);
    if (allowed.length === 0) {
      return true;
    }
    return allowed.includes(String(studentBranch || "").trim().toUpperCase());
  }

  const service = {
    useDemo,

    async registerStudent(payload) {
      const store = getStore();
      if (store.students.some((student) => student.email === payload.email)) {
        return { ok: false, message: "Student email already exists" };
      }

      store.students.push({
        student_id: nextId(store, "student"),
        name: payload.name,
        email: payload.email,
        password: payload.password,
        roll_number: payload.roll_number,
        branch: payload.branch,
        cgpa: Number(payload.cgpa)
      });
      saveStore(store);
      return { ok: true, message: "Student registered successfully" };
    },

    async loginStudent(payload) {
      const store = getStore();
      const student = store.students.find(
        (item) => item.email === payload.email && item.password === payload.password
      );

      if (!student) {
        return { ok: false, message: "Invalid email or password" };
      }

      return {
        ok: true,
        message: "Login successful",
        student: {
          id: student.student_id,
          name: student.name,
          email: student.email
        }
      };
    },

    async getEligibleJobs(studentId) {
      const store = getStore();
      const student = store.students.find((item) => item.student_id === Number(studentId));
      if (!student) {
        return [];
      }

      return store.jobs
        .filter((job) => Number(student.cgpa) >= Number(job.min_cgpa) && branchMatches(student.branch, job.branch_allowed))
        .map((job) => {
          const application = store.applications.find(
            (item) => item.student_id === student.student_id && item.job_id === job.job_id
          );

          return {
            ...job,
            application_id: application ? application.application_id : null,
            application_status: application ? application.status : null
          };
        });
    },

    async applyJob(payload) {
      const store = getStore();
      const existing = store.applications.find(
        (item) => item.student_id === Number(payload.student_id) && item.job_id === Number(payload.job_id)
      );

      if (existing) {
        return { ok: false, message: "You have already applied to this job" };
      }

      store.applications.push({
        application_id: nextId(store, "application"),
        student_id: Number(payload.student_id),
        job_id: Number(payload.job_id),
        status: "Applied",
        applied_at: new Date().toISOString()
      });
      saveStore(store);
      return { ok: true, message: "Job applied successfully" };
    },

    async getAppliedJobs(studentId) {
      const store = getStore();
      return store.applications
        .filter((item) => item.student_id === Number(studentId))
        .map((application) => {
          const job = store.jobs.find((item) => item.job_id === application.job_id);
          if (!job) {
            return null;
          }
          return {
            title: job.title,
            package_lpa: job.package_lpa,
            status: application.status,
            applied_at: application.applied_at
          };
        })
        .filter(Boolean);
    },

    async registerCompany(payload) {
      const store = getStore();
      if (store.companies.some((company) => company.contact_email === payload.contact_email)) {
        return { ok: false, message: "Company email already exists" };
      }

      store.companies.push({
        company_id: nextId(store, "company"),
        company_name: payload.company_name,
        contact_email: payload.contact_email,
        password: payload.password
      });
      saveStore(store);
      return { ok: true, message: "Company registered successfully" };
    },

    async loginCompany(payload) {
      const store = getStore();
      const company = store.companies.find(
        (item) => item.contact_email === payload.contact_email && item.password === payload.password
      );

      if (!company) {
        return { ok: false, message: "Invalid email or password" };
      }

      return {
        ok: true,
        message: "Login successful",
        company: {
          id: company.company_id,
          name: company.company_name,
          email: company.contact_email
        }
      };
    },

    async postJob(payload) {
      const store = getStore();
      store.jobs.push({
        job_id: nextId(store, "job"),
        company_id: Number(payload.company_id),
        title: payload.title,
        description: payload.description,
        package_lpa: Number(payload.package_lpa),
        min_cgpa: Number(payload.min_cgpa),
        branch_allowed: payload.branch_allowed
      });
      saveStore(store);
      return { ok: true, message: "Job posted successfully" };
    },

    async getCompanyJobs(companyId) {
      const store = getStore();
      return store.jobs.filter((job) => job.company_id === Number(companyId));
    },

    async getCompanyApplications(companyId) {
      const store = getStore();
      return store.applications
        .map((application) => {
          const job = store.jobs.find((item) => item.job_id === application.job_id);
          const student = store.students.find((item) => item.student_id === application.student_id);

          if (!job || !student || job.company_id !== Number(companyId)) {
            return null;
          }

          return {
            application_id: application.application_id,
            status: application.status,
            applied_at: application.applied_at,
            job_id: job.job_id,
            job_title: job.title,
            student_id: student.student_id,
            student_name: student.name,
            student_email: student.email,
            roll_number: student.roll_number,
            branch: student.branch,
            cgpa: student.cgpa
          };
        })
        .filter(Boolean);
    },

    async updateCompanyApplicationStatus(payload) {
      const store = getStore();
      const application = store.applications.find((item) => item.application_id === Number(payload.application_id));
      if (!application) {
        return { ok: false, message: "Application not found" };
      }

      const statusMap = {
        Accepted: "Accepted",
        Selected: "Accepted",
        Rejected: "Rejected",
        Pending: "Applied",
        Applied: "Applied"
      };

      application.status = statusMap[payload.status] || application.status;
      saveStore(store);
      return { ok: true, message: `Application ${payload.status.toLowerCase()} successfully` };
    },

    async registerAdmin(payload) {
      const store = getStore();
      if (store.admins.some((admin) => admin.email === payload.email)) {
        return { ok: false, message: "Admin email already exists" };
      }

      store.admins.push({
        admin_id: nextId(store, "admin"),
        name: payload.name,
        email: payload.email,
        password: payload.password
      });
      saveStore(store);
      return { ok: true, message: "Admin registered successfully" };
    },

    async loginAdmin(payload) {
      if (payload.email === "admin@spms.com" && payload.password === "admin123") {
        return {
          ok: true,
          message: "Login successful",
          admin: {
            email: payload.email,
            name: "Placement Admin"
          }
        };
      }

      const store = getStore();
      const admin = store.admins.find(
        (item) => item.email === payload.email && item.password === payload.password
      );

      if (!admin) {
        return { ok: false, message: "Invalid admin credentials" };
      }

      return {
        ok: true,
        message: "Login successful",
        admin: {
          email: admin.email,
          name: admin.name
        }
      };
    },

    async getAdminStats() {
      const store = getStore();
      return {
        total_students: store.students.length,
        total_jobs: store.jobs.length,
        total_applications: store.applications.length,
        placed_students: store.applications.filter((item) => ["Accepted", "Selected"].includes(item.status)).length
      };
    },

    async getAdminJobs() {
      const store = getStore();
      return store.jobs.map((job) => {
        const company = store.companies.find((item) => item.company_id === job.company_id);
        return {
          ...job,
          company_name: company ? company.company_name : "Unknown Company"
        };
      });
    }
  };

  window.SPMSDataService = service;
})();
