import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";

const Login = () => {
  const { login } = useAuth();
  const { loadPosts } = usePosts();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    try {
      await login(email, password);
      await loadPosts();
      navigate("/");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.message || "Failed to log in. Please check your credentials.",
      );
    }
  }

  return (
    <div className="max-w-md mx-auto my-19 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
      <p className="text-sm text-gray-500 mb-6">Log in to your account</p>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {errorMessage}
        </div>
      )}

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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-md transition duration-150 cursor-pointer"
        >
          Login
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
