import { useState } from "react";
import axios from "axios";

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axios
      .post("http://127.0.0.1:5000/api/login", { username, password })
      .then((response) => {
        const token = response.data.access_token;
        localStorage.setItem("token", token); // Store token in localStorage
        onLogin(token);
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("Invalid credentials");
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
