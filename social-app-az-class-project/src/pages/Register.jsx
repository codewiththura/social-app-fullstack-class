import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";

/**
 * Register Page Component
 * 
 * Beginner-Friendly Explanation:
 * This component displays the user sign-up form.
 * It lets a new visitor create an account by providing:
 * - Full Name
 * - Username
 * - Email Address
 * - Password
 * - Bio (Optional)
 * 
 * Flow:
 * 1. User types into the input fields.
 * 2. React tracks what is typed using `useState`.
 * 3. User clicks "Create Account".
 * 4. We send this information to the backend `/auth/register` API.
 * 5. If successful, we automatically log the user in and redirect to Home ("/").
 * 6. If there is an error (e.g. Email already registered), we display an error message.
 */
const Register = () => {
  // Access authentication functions from our global AuthContext
  const { register, login } = useAuth();

  // Access post reloading function so the feed is fresh for the new user
  const { loadPosts } = usePosts();

  // React Router hook to change pages programmatically
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // Form State: Variables that hold what the user types in each box
  // -------------------------------------------------------------
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  // Feedback State: Track loading status and error messages
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------------------------------------
  // Form Submit Handler
  // -------------------------------------------------------------
  async function handleSubmit(e) {
    // Prevent the default browser behavior (which reloads the whole page)
    e.preventDefault();

    // Reset previous error messages
    setErrorMessage("");

    // Basic client-side validation
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in all required fields (Name, Username, Email, and Password).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      // Indicate that registration request is in progress
      setIsLoading(true);

      // Step 1: Send registration data to backend
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        bio: bio.trim(),
      });

      // Step 2: Auto-login the newly created user so they don't have to re-type credentials
      await login(email.trim().toLowerCase(), password);

      // Step 3: Refresh posts if available
      if (loadPosts) {
        await loadPosts();
      }

      // Step 4: Redirect the user to the home feed
      navigate("/");
    } catch (err) {
      // Show user-friendly error message returned by server or network
      console.error("Registration error:", err);
      setErrorMessage(err.message || "Failed to register. Please try again.");
    } finally {
      // Stop the loading spinner/indicator
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 p-6">
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
      <p className="text-sm text-gray-500 mb-6">
        Join our social community today
      </p>

      {/* Error Alert Box: Only visible if an error exists */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Registration Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Email Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Bio Field (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio <span className="text-xs text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows="2"
            placeholder="A short introduction about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-gray-300 rounded-md text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 text-sm rounded-md transition duration-150 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>

      {/* Switch to Login Page */}
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Log in here
        </Link>
      </div>
    </div>
  );
};

export default Register;
