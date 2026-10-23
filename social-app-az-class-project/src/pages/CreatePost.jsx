import { useState } from "react";
import { useNavigate } from "react-router";
import { usePosts } from "../context/PostContext";
import { API_URL, authFetch } from "../services/api";

export default function CreatePost() {
  const [post, setPost] = useState({
    title: "",
    body: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { loadPosts } = usePosts();
  const navigate = useNavigate();

  const uploadPostPhoto = async (postId, file) => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await authFetch(`${API_URL}/posts/${postId}/photo`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("HTTP error");
    }

    const data = await response.json();
    return data;
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch(`${API_URL}/posts`, {
        method: "POST",
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        console.error("HTTP error");
      }

      const newPost = await response.json();

      if (imageFile && newPost) await uploadPostPhoto(newPost._id, imageFile);
      await loadPosts();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="border border-gray-200 rounded-lg max-w-xl mx-auto my-4 p-6">
      <h1 className="text-2xl mb-4">Create Post</h1>
      <form className="space-y-4" onSubmit={handleOnSubmit}>
        <label className="block text-sm font-medium mb-1">Post Title</label>
        <input
          type="text"
          name="title"
          value={post.title}
          className="w-full border border-gray-200 rounded-md p-3 text-sm"
          onChange={handleOnChange}
        />
        <label className="block text-sm font-medium">Image URL</label>
        <input
          type="file"
          className="w-full border border-gray-200 rounded-md p-3 text-sm"
          onChange={handleImageChange}
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Selected Preview"
            className="w-full h-56 object-cover rounded border border-gray-200"
          />
        )}

        <label className="block text-sm font-medium">Post Content</label>
        <textarea
          name="body"
          value={post.body}
          onChange={handleOnChange}
          className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Publish Post
        </button>
      </form>
    </div>
  );
}
