import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePosts } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

function PostCard({
  id,
  title,
  author,
  description,
  imageUrl,
  showDetailsLink,
  likeCounts,
  initialIsLiked,
  initialIsSaved,
}) {
  const { isAuthenticated } = useAuth();
  const { toggleLike, toggleSave, deletePost } = usePosts();
  const [likes, setLikes] = useState(likeCounts);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);

  const navigate = useNavigate();

  useEffect(() => {
    setLikes(likeCounts);
    setIsLiked(initialIsLiked);
    setIsSaved(initialIsSaved);
  }, [likeCounts, initialIsLiked, initialIsSaved]);

  async function handleLike() {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
      await toggleLike(id);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
      await toggleLike(id);
    }
  }

  async function handleSave() {
    if (isSaved) {
      setIsSaved(false);
      await toggleSave(id);
    } else {
      setIsSaved(true);
      await toggleSave(id);
    }
  }

  async function handleDelete() {
    await deletePost(id);
    if (!showDetailsLink) {
      navigate("/");
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-gray-500">Posted by {author?.name}</p>

        {isAuthenticated && (
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => navigate(`/edit-post/${id}`)}
              className="text-blue-600 hover:underline hover:cursor-pointer font-medium"
            >
              Edit
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline hover:cursor-pointer font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <h2 className="text-md font-bold text-gray-900 mb-3">{title}</h2>
      <div>
        <img src={imageUrl} alt="Image" className="w-full h-64 object-cover" />
      </div>
      <p className="text-sm my-4">{description}</p>

      <div className="flex justify-between items-center py-2">
        <span>{likes} likes</span>
        {showDetailsLink && <Link to={`/post/${id}`}>View Details</Link>}
      </div>
      {isAuthenticated && (
        <div className="flex justify-between items-center border-t border-gray-100 pt-2 text-sm">
          <button
            onClick={handleLike}
            className={`py-1.5 font-medium text-center rounded hover:bg-gray-50 ${isLiked ? "text-blue-600" : "text-gray-600"} hover:cursor-pointer`}
          >
            {isLiked ? "Liked" : "Like"}
          </button>
          <button
            onClick={() => navigate(`/post/${id}`)}
            className="py-1.5 font-medium text-center rounded hover:bg-gray-50 text-gray-600 hover:cursor-pointer"
          >
            Comment
          </button>
          <button
            onClick={handleSave}
            className={`py-1.5 font-medium text-center rounded hover:bg-gray-50 ${isSaved ? "text-blue-600" : "text-gray-600"} hover:cursor-pointer`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PostCard;
