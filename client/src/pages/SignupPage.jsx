import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    localStorage.setItem("userEmail", email.trim());
    navigate("/dashboard");
    window.location.reload();
  }

  return (
    <div>
        <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
            <label htmlFor="signup-email">Email</label>
            <input
                type="email"
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
            />
            <button type="submit">Sign Up</button>
        </form>
    </div>
  )
}
