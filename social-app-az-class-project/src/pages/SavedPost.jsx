import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { API_URL, authFetch } from "../services/api";
import { usePosts } from "../context/PostContext";

export function SavedPosts() {
  const { posts, loading } = usePosts();
  const savedPosts = posts.filter((p) => p.isSaved);

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <>
      {savedPosts.length === 0 ? (
        <>
          <div className="max-w-3xl mx-auto p-4 ">
            <h1 className="text-lg text-gray-700 font-bold mb-4">
              Saved Posts
            </h1>
            <div className="text-center p-8 border border-dashed border-gray-300">
              No saved posts found
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="max-w-3xl mx-auto p-4 ">
            <h1 className="text-lg text-gray-700 font-bold mb-4">
              Saved Posts
            </h1>
            {savedPosts.map((post) => (
              <PostCard
                id={post._id}
                key={post._id}
                author={post.author}
                title={post.title}
                description={post.body}
                imageUrl={post.imageUrl}
                showDetailsLink={true}
                likeCounts={post.likesCount}
                initialIsLiked={post.isLiked}
                initialIsSaved={post.isSaved}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
