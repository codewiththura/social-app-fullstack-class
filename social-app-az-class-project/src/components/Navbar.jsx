import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate()

  async function handleLogout() {
    await logout();
    navigate("/login")
  }

  return (
    <nav className="bg-white border-b border-gray-300">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Social App
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            Home
          </Link>
          {
            isAuthenticated ? (
              <>
                <Link to="/saved" className="text-gray-500 hover:text-gray-900">
                  Saved
                </Link>
                <Link
                  to="/create-post"
                  className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Create Post
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )
          }

          {isAuthenticated && (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <img
                src={
                  user.avatarUrl ||
                  "https://unsplash.com/photos/ZHvM3XIOHoE/download?force=true&w=640"
                }
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
              <span className="text-sm font-semibold">{user.name}</span>
              <button className="text-sm text-red-500 font-medium ml-3 hover:cursor-pointer" onClick={handleLogout}>Logout</button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
