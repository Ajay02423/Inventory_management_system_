import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const DEFAULT_USERS = [
  { username: "admin", password: "admin123", name: "Admin User", role: "Admin" },
  { username: "manager", password: "manager123", name: "Store Manager", role: "Manager" },
  { username: "staff", password: "staff123", name: "Staff Member", role: "Staff" },
];

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem("inv_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    const saved = localStorage.getItem("inv_users");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem("inv_users", JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = (username, password) => {
    const currentUsers = getUsers();
    const matchedUser = currentUsers.find(
      (candidate) => candidate.username === username && candidate.password === password
    );

    if (!matchedUser) {
      return { success: false, error: "Invalid username or password." };
    }

    const userData = {
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role,
      initials: matchedUser.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    };

    localStorage.setItem("inv_user", JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("inv_user");
    setUser(null);
  };

  const register = ({ username, password, name, role = "Staff" }) => {
    const currentUsers = getUsers();

    const exists = currentUsers.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (exists) {
      return { success: false, error: "Username is already taken." };
    }

    const newUser = {
      username: username.trim(),
      password: password,
      name: name.trim(),
      role,
    };

    const updated = [...currentUsers, newUser];
    saveUsers(updated);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoggedIn: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
