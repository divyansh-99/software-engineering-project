const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try{

        const response = await fetch(`${API_BASE}/api/students/login`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log(data); // very important for debugging

        // check if student object exists
        if(data.student){

            // store student id
            localStorage.setItem("studentId", data.student.id);

            // redirect to dashboard
            window.location.href = "studentDashboard.html";

        }
        else{

            document.getElementById("message").innerText = data.message;

        }

    }
    catch(error){
        console.error(error);
        document.getElementById("message").innerText = "Server error";
    }

});
