import { useEffect, useState } from "react";
import "./App.css";
const API = "https://project-management-api-t1ml.onrender.com/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");
  const [loginMode, setLoginMode] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [dashboard, setDashboard] = useState({});
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [taskName, setTaskName] = useState("");
  const [taskPriority, setTaskPriority] = useState("LOW");

  const request = async (url, options = {}) => {
    const response = await fetch(API + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  const login = async (e) => {
    e.preventDefault();

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setEmail("");
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  };

  const register = async (e) => {
    e.preventDefault();

    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      alert("Registration successful. Please login.");
      setLoginMode(true);
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const loadDashboard = async () => {
    try {
      const data = await request("/dashboard");
      setDashboard(data.dashboard);
    } catch (error) {
      alert(error.message);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await request("/projects");
      setProjects(data.projects);
    } catch (error) {
      alert(error.message);
    }
  };

  const loadTasks = async (projectId) => {
    try {
      const data = await request(`/projects/${projectId}/tasks`);
      setTasks(data.tasks);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard();
      loadProjects();
    }
  }, [token]);

  const createProject = async (e) => {
    e.preventDefault();

    try {
      await request("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
        }),
      });

      setProjectName("");
      setProjectDescription("");
      await loadProjects();
      alert("Project created");
    } catch (error) {
      alert(error.message);
    }
  };

  const openProject = async (project) => {
    setSelectedProject(project);
    setPage("tasks");
    await loadTasks(project.id);
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!selectedProject) return;

    try {
      await request(`/projects/${selectedProject.id}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          name: taskName,
          priority: taskPriority,
        }),
      });

      setTaskName("");
      setTaskPriority("LOW");
      await loadTasks(selectedProject.id);
      await loadDashboard();
      alert("Task created");
    } catch (error) {
      alert(error.message);
    }
  };

  const completeTask = async (task) => {
    try {
      await request(
        `/projects/${selectedProject.id}/tasks/${task.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status:
              task.status === "COMPLETED"
                ? "PENDING"
                : "COMPLETED",
          }),
        }
      );

      await loadTasks(selectedProject.id);
      await loadDashboard();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>ProjectFlow</h1>
          <p>Project Management System</p>

          <form onSubmit={loginMode ? login : register}>
            {!loginMode && (
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              {loginMode ? "Login" : "Create Account"}
            </button>
          </form>

          <button
            className="link-button"
            onClick={() => setLoginMode(!loginMode)}
          >
            {loginMode
              ? "Create a new account"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>ProjectFlow</h1>
          <span>Project Management System</span>
        </div>

        <button onClick={logout}>Logout</button>
      </header>

      <nav>
        <button onClick={() => setPage("dashboard")}>
          Dashboard
        </button>

        <button
          onClick={() => {
            setPage("projects");
            loadProjects();
          }}
        >
          Projects
        </button>
      </nav>

      <main>
        {page === "dashboard" && (
          <>
            <h2>Dashboard</h2>

            <div className="stats">
              <div>
                <strong>{dashboard.totalProjects || 0}</strong>
                <span>Total Projects</span>
              </div>

              <div>
                <strong>{dashboard.totalTasks || 0}</strong>
                <span>Total Tasks</span>
              </div>

              <div>
                <strong>{dashboard.completedTasks || 0}</strong>
                <span>Completed Tasks</span>
              </div>

              <div>
                <strong>{dashboard.pendingTasks || 0}</strong>
                <span>Pending Tasks</span>
              </div>

              <div>
                <strong>
                  {dashboard.projectsInProgress || 0}
                </strong>
                <span>Projects In Progress</span>
              </div>
            </div>
          </>
        )}

        {page === "projects" && (
          <>
            <h2>Projects</h2>

            <form className="create-form" onSubmit={createProject}>
              <input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />

              <input
                placeholder="Description"
                value={projectDescription}
                onChange={(e) =>
                  setProjectDescription(e.target.value)
                }
              />

              <button type="submit">+ Create Project</button>
            </form>

            <div className="project-grid">
              {projects.map((project) => (
                <div className="project-card" key={project.id}>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>

                  <span className="status">
                    {project.status}
                  </span>

                  <button onClick={() => openProject(project)}>
                    View Tasks
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "tasks" && selectedProject && (
          <>
            <button
              className="back"
              onClick={() => setPage("projects")}
            >
              ← Back to Projects
            </button>

            <h2>{selectedProject.name}</h2>

            <form className="create-form" onSubmit={createTask}>
              <input
                placeholder="Task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
              />

              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <button type="submit">+ Add Task</button>
            </form>

            <div className="task-list">
              {tasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div>
                    <h3>{task.name}</h3>
                    <span>
                      {task.priority} · {task.status}
                    </span>
                  </div>

                  <button onClick={() => completeTask(task)}>
                    {task.status === "COMPLETED"
                      ? "Mark Pending"
                      : "Complete"}
                  </button>
                </div>
              ))}

              {tasks.length === 0 && (
                <p>No tasks yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;