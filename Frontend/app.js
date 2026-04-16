async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/employees/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

   
    if (data.token) {
      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      if (payload.role === 'EMPLOYER') {
        location.href = '/job_schedule.html';
      }
        else {
          location.href = '/schedule.html'
        }
      }

    document.getElementById("result").innerText =
      JSON.stringify(data, null, 2);

  } catch (err) {
    console.error("Login error:", err);
    document.getElementById("result").innerText = "Login failed";
  }
}


async function getEmployees() {
  const token = localStorage.getItem("token");

  if (!token) {
    document.getElementById("result").innerText =
      "No token found. Please login first.";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/employees", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    document.getElementById("result").innerText =
      JSON.stringify(data, null, 2);

  } catch (err) {
    console.error("Fetch employees error:", err);
    document.getElementById("result").innerText =
      "Failed to fetch employees";
  }
}



function logout() {
  localStorage.removeItem("token");
  document.getElementById("result").innerText = "Logged out";
}