import { useState } from "react";
import API from "../api/client";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../context/SnackbarContext";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // 🔥 ye function login karega
  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login/", {
        email,
        password,
      });

      console.log(res.data);

      // 🔥 token save
      localStorage.setItem("token", res.data.data.access_token);
      const { message } = res.data;

      showSnackbar(message, "success");

      // redirect
      navigate("/");
    } catch (error) {
      const message =
      error.response?.data?.message || "Something went wrong";
      showSnackbar(message, "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}