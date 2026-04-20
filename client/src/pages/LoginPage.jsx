import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    localStorage.setItem("userEmail", email);
    if (email.trim()) {
      window.localStorage.setItem("userEmail", email.trim());
      navigate("/dashboard");
      window.location.reload();
    }
  };

  return (
    <div>
      <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button type="submit">Log In</button> 
        </form>
    </div>
  );
}
