import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";

const Login = () => {
  const { login } = useAuth();
  const { loadPosts } = usePosts();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      await loadPosts();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-md mx-auto my-19 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
      <p className="text-sm text-gray-500 mb-6">Log in to your account</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium">Email Address</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md text-sm p-2.5"
        />

        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          placeholder="*******"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md text-sm p-2.5"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 text-sm"
        >
          Login
        </button>
      </form>

      {/* Demo Credentials Helper for class/preview */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 space-y-1">
        <p className="font-semibold text-gray-700">Demo Accounts:</p>
        <p>
          Email:{" "}
          <span className="font-mono text-gray-900">thura@example.com</span> |
          Password: <span className="font-mono text-gray-900">password123</span>
        </p>
        <p>
          Email:{" "}
          <span className="font-mono text-gray-900">maythin@example.com</span> |
          Password: <span className="font-mono text-gray-900">password123</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
