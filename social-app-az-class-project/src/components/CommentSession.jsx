import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL, authFetch } from "../services/api";

const CommentSession = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    async function getComments() {
      try {
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
          method: "GET",
        });

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getComments();
  }, [postId]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentBody) return;

    try {
      const response = await authFetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentBody }),
      });

      const newComment = await response.json();
      setComments((prev) => [...prev, newComment]);
      setCommentBody("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Comments ({comments.length})
      </h2>

      {isAuthenticated && (
        <form
          onSubmit={handleAddComment}
          className="mb-6 space-y-3 border-b border-gray-100 pb-6"
        >
          <textarea
            rows="3"
            placeholder="Write comments.."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-blue-600"
          ></textarea>
          <button
            className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            type="submit"
          >
            Submit Comment
          </button>
        </form>
      )}

      {/* Comments List — React Key ဖြင့် map */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="border-b border-gray-100 pb-3 last:border-b-0"
          >
            <p className="text-sm font-semibold text-gray-800">
              {comment.name}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {comment.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSession;
