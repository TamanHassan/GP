const apiBase = "http://localhost:3000/employees";

function showSection(id, visible) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = visible ? "block" : "none";
  }
}

function showStatus(message, type = 'info') {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.className = `status-message status-${type}`;
    statusEl.innerText = message;
    statusEl.style.display = 'block';
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${apiBase}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      showStatus("Logged in successfully! Redirecting to schedule...", "success");
      showSection("logout-button", true);
      // Redirect to schedule page
      window.location.href = "/schedule.html";
    } else {
      showStatus(data.message || "Login failed.", "error");
    }
  } catch (err) {
    console.error("Login error:", err);
    showStatus("Login failed. Please try again.", "error");
    document.getElementById("result").innerText = "Login failed";
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function viewEmployees() {
  const token = localStorage.getItem("token");
  
  // If not logged in, try to login first
  if (!token) {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showStatus("Please enter email and password to view employees.", "error");
      return;
    }

    try {
      showStatus("Logging in...", "info");
      const response = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        showStatus("Logged in successfully! Loading employees...", "success");
        showSection("logout-button", true);
        // Clear the result area and now load employees
        document.getElementById("result").innerHTML = "";
        await loadEmployees();
      } else {
        showStatus(data.message || "Login failed.", "error");
        document.getElementById("result").innerHTML = "";
      }
    } catch (err) {
      console.error("Login error:", err);
      showStatus("Login failed. Please try again.", "error");
      document.getElementById("result").innerText = "Login failed";
    }
  } else {
    // Already logged in, just load employees
    await loadEmployees();
  }
}

async function loadEmployees() {
  try {
    showStatus("Loading users...", "info");
    
    const response = await fetch(apiBase, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      showStatus(data.message || "Failed to load users.", "error");
      document.getElementById("employee-area").style.display = "none";
      return;
    }

    renderEmployees(data.employees || data);
    showSection("employee-area", true);
    showStatus(`Successfully loaded ${data.length || 0} users.`, "success");
    // Don't show raw JSON output
  } catch (err) {
    console.error("Fetch employees error:", err);
    showStatus("Failed to fetch users. Please try again.", "error");
    document.getElementById("result").innerHTML = "";
  }
}

async function addEmployee() {
  const token = localStorage.getItem("token");
  if (!token) {
    showStatus("Please login first to add employees.", "error");
    return;
  }

  const name = document.getElementById("employee-name").value;
  const email = document.getElementById("employee-email").value;
  const password = document.getElementById("employee-password").value;

  if (!name || !email || !password) {
    showStatus("Please enter name, email and password.", "error");
    return;
  }

  try {
    showStatus("Adding new employee...", "info");
    
    const response = await fetch(apiBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      showStatus("Employee added successfully!", "success");
      document.getElementById("employee-name").value = "";
      document.getElementById("employee-email").value = "";
      document.getElementById("employee-password").value = "";
      // Clear result area and refresh employee list
      document.getElementById("result").innerHTML = "";
      // Small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadEmployees();
    } else {
      // Handle specific error cases
      if (data.message && data.message.includes("Unique constraint failed")) {
        showStatus("A user with this email already exists. Please use a different email.", "error");
      } else {
        showStatus(data.message || "Failed to add employee.", "error");
      }
    }

    // Don't show raw error output - only show clean status messages
  } catch (err) {
    console.error("Add employee error:", err);
    showStatus("Failed to add employee. Please try again.", "error");
    document.getElementById("result").innerHTML = "";
  }
}

async function deleteEmployee(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    showStatus("Please login first to delete users.", "error");
    return;
  }

  try {
    showStatus("Deleting user...", "info");
    
    const response = await fetch(`${apiBase}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      showStatus("User deleted successfully!", "success");
      await loadEmployees();
    } else {
      const data = await response.json();
      showStatus(data.message || "Failed to delete user.", "error");
    }
  } catch (err) {
    console.error("Delete employee error:", err);
    showStatus("Failed to delete user. Please try again.", "error");
    document.getElementById("result").innerHTML = "";
  }
}

function logout() {
  localStorage.removeItem("token");
  showSection("logout-button", false);
  showSection("employee-area", false);
  showStatus("Logged out successfully.", "info");
  document.getElementById("result").innerText = "";
}

function renderEmployees(users) {
  const container = document.getElementById("employee-list");
  if (!Array.isArray(users) || users.length === 0) {
    container.innerHTML = "<div class='status-message status-info'>No users found. Add your first employee below!</div>";
    return;
  }

  const rows = users
    .map(
      (user) => {
        const roleClass = user.role === 'EMPLOYEE' ? 'role-employee' : 'role-employer';
        return `
          <tr>
            <td>${user.userId}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${roleClass}">${user.role}</span></td>
            <td><button class="btn btn-danger" onclick="deleteEmployee(${user.userId})">Delete</button></td>
          </tr>
        `;
      }
    )
    .join("");

  container.innerHTML = `
    <table class="users-table">
      <thead>
        <tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

window.login = login;
window.viewEmployees = viewEmployees;
window.addEmployee = addEmployee;
window.deleteEmployee = deleteEmployee;
window.logout = logout;
