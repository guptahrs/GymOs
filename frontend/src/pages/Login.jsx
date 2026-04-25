// import { useState } from "react";
// import API from "../api/client";
// import { useNavigate } from "react-router-dom";
// import { logout } from "../utils/auth";
// import { useSnackbar } from "../context/SnackbarContext";
// import { useMutation } from '@tanstack/react-query';


// export default function Login() {
//   // On mount, clear any previous login state (optional, for safety)
//   // logout();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const { showSnackbar } = useSnackbar();
//   const navigate = useNavigate();

//   // 🔥 ye function login karega
//   const mutation = useMutation(async (creds) => {
//     const res = await API.post('/auth/login/', creds);
//     return res.data;
//   }, {
//     onSuccess: (resData) => {
//       const { data, message } = resData;
//       const userDetails = data["user details"] || data.user_details || data.user || null;
//       if (userDetails) {
//         localStorage.setItem("user", JSON.stringify(userDetails));
//       }
//       localStorage.setItem("token", data.token || data.access_token);
//       if (data.gym_id) localStorage.setItem("gym_id", data.gym_id);
//       else localStorage.removeItem("gym_id");
//       showSnackbar(message, 'success');
//       if (data.user_type === 'super_admin') navigate('/super-admin');
//       else navigate('/');
//     },
//     onError: (err) => {
//       const message = err.response?.data?.message || err.message || 'Something went wrong';
//       showSnackbar(message, 'error');
//     }
//   });

//   const handleLogin = () => {
//     mutation.mutate({ email, password });
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Login</h2>

//       <input
//         type="email"
//         placeholder="Email"
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <br /><br />

//       <input
//         type="password"
//         placeholder="Password"
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <br /><br />

//       <button onClick={handleLogin}>Login</button>
//     </div>
//   );
// }



import { useState } from "react";
import API from "../api/client";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../context/SnackbarContext";
import { useMutation } from '@tanstack/react-query';
import "../css/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const mutation = useMutation(async (creds) => {
    const res = await API.post('/auth/login/', creds);
    return res.data;
  }, {
    onSuccess: (resData) => {
      const { data, message } = resData;
      const userDetails = data["user details"] || data.user_details || data.user || null;
      const user_type = userDetails?.user_type || null;
      if (userDetails) {
        localStorage.setItem("user", JSON.stringify(userDetails));
      }
      localStorage.setItem("token", data.token || data.access_token);
      if (data.gym_id) localStorage.setItem("gym_id", data.gym_id);
      else localStorage.removeItem("gym_id");
      showSnackbar(message, 'success');
      console.log("....Logged in user type...:", user_type);
      if (user_type === 'super_admin') navigate('/super-admin');
      else
        if (user_type === 'gym_owner') navigate('/gym-admin'); 
        else navigate('/');
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message;
      showSnackbar(message, 'error');
    }
  });

  const handleLogin = () => {
    mutation.mutate({ email, password });
  };

  return (
    <div className="login-container">
      
      <div className="login-left">
        <h1>Gymora  💪</h1>
        <h1></h1>
        {/* <p>Manage your gym like a pro 💪</p> */}
      </div>

      <div className="login-card">
        <h2>Welcome Back</h2>

        <input
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          {mutation.isLoading ? "Logging in..." : "Login"}
        </button>

      </div>
    </div>
  );
}