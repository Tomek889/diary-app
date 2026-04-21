import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      localStorage.setItem("userEmail", cleanEmail);
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.message);

    }
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
        {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}
