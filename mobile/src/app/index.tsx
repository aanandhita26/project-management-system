import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const API = "http://10.3.117.98:5000/api";

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
};

type Task = {
  id: string;
  name: string;
  priority: string;
  status: string;
};

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [loginMode, setLoginMode] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Password123");

  const [page, setPage] = useState("dashboard");
  const [dashboard, setDashboard] = useState<any>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [projectName, setProjectName] = useState("");
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const savedToken = await SecureStore.getItemAsync("token");

    if (savedToken) {
      setToken(savedToken);
      await loadDashboard(savedToken);
      await loadProjects(savedToken);
    }

    setLoading(false);
  };

  const apiRequest = async (
    endpoint: string,
    options: any = {},
    authToken = token
  ) => {
    const response = await fetch(API + endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  };

  const login = async () => {
    try {
      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        null
      );

      await SecureStore.setItemAsync("token", data.token);
      setToken(data.token);

      await loadDashboard(data.token);
      await loadProjects(data.token);
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  };

  const register = async () => {
    try {
      await apiRequest(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            fullName,
            email,
            password,
          }),
        },
        null
      );

      Alert.alert(
        "Success",
        "Account created. You can now login."
      );

      setLoginMode(true);
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    }
  };

  const loadDashboard = async (authToken = token) => {
    try {
      const data = await apiRequest(
        "/dashboard",
        {},
        authToken
      );

      setDashboard(data.dashboard);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const loadProjects = async (authToken = token) => {
    try {
      const data = await apiRequest(
        "/projects",
        {},
        authToken
      );

      setProjects(data.projects);
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      const data = await apiRequest(
        `/projects/${projectId}/tasks`
      );

      setTasks(data.tasks);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const createProject = async () => {
    if (!projectName.trim()) return;

    try {
      await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
        }),
      });

      setProjectName("");
      await loadProjects();
      await loadDashboard();

      Alert.alert("Success", "Project created");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const createTask = async () => {
    if (!selectedProject || !taskName.trim()) return;

    try {
      await apiRequest(
        `/projects/${selectedProject.id}/tasks`,
        {
          method: "POST",
          body: JSON.stringify({
            name: taskName,
            priority: "MEDIUM",
          }),
        }
      );

      setTaskName("");
      await loadTasks(selectedProject.id);
      await loadDashboard();

      Alert.alert("Success", "Task created");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const toggleTask = async (task: Task) => {
    if (!selectedProject) return;

    try {
      await apiRequest(
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
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setPage("dashboard");
    setProjects([]);
    setTasks([]);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authCard}>
          <Text style={styles.title}>ProjectFlow</Text>
          <Text style={styles.subtitle}>
            Project Management System
          </Text>

          {!loginMode && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={styles.button}
            onPress={loginMode ? login : register}
          >
            <Text style={styles.buttonText}>
              {loginMode ? "Login" : "Create Account"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLoginMode(!loginMode)}
          >
            <Text style={styles.link}>
              {loginMode
                ? "Create a new account"
                : "Already have an account? Login"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ProjectFlow</Text>
          <Text style={styles.headerSubtitle}>
            Project Management
          </Text>
        </View>

        <Pressable onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.nav}>
        <Pressable
          style={styles.navButton}
          onPress={() => {
            setPage("dashboard");
            loadDashboard();
          }}
        >
          <Text>Dashboard</Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={() => {
            setPage("projects");
            loadProjects();
          }}
        >
          <Text>Projects</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {page === "dashboard" && (
          <>
            <Text style={styles.heading}>Dashboard</Text>

            <View style={styles.statsGrid}>
              <Stat
                label="Projects"
                value={dashboard.totalProjects || 0}
              />
              <Stat
                label="Tasks"
                value={dashboard.totalTasks || 0}
              />
              <Stat
                label="Completed"
                value={dashboard.completedTasks || 0}
              />
              <Stat
                label="Pending"
                value={dashboard.pendingTasks || 0}
              />
              <Stat
                label="In Progress"
                value={
                  dashboard.projectsInProgress || 0
                }
              />
            </View>
          </>
        )}

        {page === "projects" && (
          <>
            <Text style={styles.heading}>Projects</Text>

            <View style={styles.createRow}>
              <TextInput
                style={styles.flexInput}
                placeholder="Project name"
                value={projectName}
                onChangeText={setProjectName}
              />

              <Pressable
                style={styles.smallButton}
                onPress={createProject}
              >
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>

            {projects.map((project) => (
              <View
                style={styles.card}
                key={project.id}
              >
                <Text style={styles.cardTitle}>
                  {project.name}
                </Text>

                <Text style={styles.status}>
                  {project.status}
                </Text>

                <Pressable
                  style={styles.button}
                  onPress={async () => {
                    setSelectedProject(project);
                    setPage("tasks");
                    await loadTasks(project.id);
                  }}
                >
                  <Text style={styles.buttonText}>
                    View Tasks
                  </Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {page === "tasks" && selectedProject && (
          <>
            <Pressable
              onPress={() => setPage("projects")}
            >
              <Text style={styles.link}>
                ← Back to Projects
              </Text>
            </Pressable>

            <Text style={styles.heading}>
              {selectedProject.name}
            </Text>

            <View style={styles.createRow}>
              <TextInput
                style={styles.flexInput}
                placeholder="Task name"
                value={taskName}
                onChangeText={setTaskName}
              />

              <Pressable
                style={styles.smallButton}
                onPress={createTask}
              >
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>

            {tasks.map((task) => (
              <View
                style={styles.taskCard}
                key={task.id}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {task.name}
                  </Text>

                  <Text style={styles.status}>
                    {task.priority} · {task.status}
                  </Text>
                </View>

                <Pressable
                  style={styles.smallButton}
                  onPress={() => toggleTask(task)}
                >
                  <Text style={styles.buttonText}>
                    {task.status === "COMPLETED"
                      ? "Undo"
                      : "Complete"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#172033",
  },

  authCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 5,
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  smallButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  link: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "600",
  },

  header: {
    backgroundColor: "#172033",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#cbd5e1",
  },

  logout: {
    color: "white",
    fontWeight: "600",
  },

  nav: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  navButton: {
    padding: 10,
    marginRight: 10,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  statsGrid: {
    gap: 12,
  },

  stat: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },

  statValue: {
    fontSize: 30,
    fontWeight: "700",
  },

  statLabel: {
    color: "#6b7280",
    marginTop: 5,
  },

  createRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  flexInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 7,
  },

  status: {
    color: "#64748b",
    marginBottom: 10,
    fontSize: 13,
  },

  taskCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});