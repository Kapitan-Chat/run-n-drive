import { useNavigate } from "react-router-dom";
import styles from "./authentication.module.css";
import { useState } from "react";
import { useAuth } from "../Provider/AuthProvider";
import { loginRequest } from "./requests";

const Login = ({ onSubmit, animations }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isInProcess, setInProcess] = useState(false);
  const auth = useAuth();

  const navigate = useNavigate();

  onSubmit.current = async (e) => {
    setInProcess(true);
    loginRequest({ username: login, password }, auth, (isSuccess) => {
      if (isSuccess) {
        navigate("/main");
        setInProcess(false);
      } else {
        animations.animateText(
          "Wrong username or password! Are you a hacker??"
        );
        animations.angry();
        setInProcess(false);
      }
    });
  };

  return (
    <div className={styles.login_content}>
      <h2 className={styles.login_title}>Login</h2>
      <div className={styles.login_fields}>
        <input
          type="text"
          placeholder="Enter your username"
          value={login}
          required
          onChange={(e) => setLogin(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={isInProcess}
        className={styles.login_button}
      >
        {isInProcess ? "Logging in..." : "Login"}
      </button>
      <p className={styles.bottom_text}>
        Don't have account?{" "}
        <span onClick={() => navigate("/register")}>Create account</span>
      </p>
    </div>
  );
};

export default Login;
