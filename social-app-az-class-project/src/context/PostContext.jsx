import { createContext, useContext, useEffect, useState } from "react";
import { API_URL, authFetch } from "../services/api";

const PostContext = createContext(null);

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadPosts() {
    setLoading(true);
    authFetch(`${API_URL}/posts`)
      .then((response) => response.json())
      .then((result) => {
        setPosts(result);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function toggleLike(id) {
    const response = await authFetch(`${API_URL}/posts/${id}/like`, {
      method: "POST",
    });

    if (!response.ok) return null;
    const updatePost = await response.json();
    setPosts((prev) =>
      prev.map((post) => (post._id === id ? updatePost : post)),
    ); // post တွေထဲက like လုပ်လိုက်တဲ့ post တစ်ခုကို update သွားလုပ်ပေး
  }

  async function toggleSave(id) {
    const response = await authFetch(`${API_URL}/posts/${id}/save`, {
      method: "POST",
    });

    if (!response.ok) return null;
    const updatePost = await response.json();
    setPosts((prev) =>
      prev.map((post) => (post._id === id ? updatePost : post)),
    ); // post တွေထဲက save လုပ်လိုက်တဲ့ post တစ်ခုကို update သွားလုပ်ပေး
  }

  async function deletePost(id) {
    const response = await authFetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) return null;
    await response.json();
    setPosts((prev) => prev.filter((post) => post._id !== id)); // post တွေထဲက user ဖျက်လိုက်တဲ့ post တစ်ခုကို ဖယ်ထုတ်ပေး
  }

  const value = {
    posts,
    toggleLike,
    toggleSave,
    loadPosts,
    deletePost,
    loading,
  };
  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostProvider");
  }

  return context;
}
