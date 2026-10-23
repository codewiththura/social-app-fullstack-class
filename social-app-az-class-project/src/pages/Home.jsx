import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { usePosts } from "../context/PostContext";

function Home() {
  const { posts, loading } = usePosts();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLocaleLowerCase();
    const matchedTitle = post.title.toLocaleLowerCase().includes(term);
    const matchedBody = post.body.toLocaleLowerCase().includes(term);
    return matchedTitle || matchedBody;
  });

  if (loading) return <div className="max-w-3xl mx-auto p-4 ">Loading..</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 ">
      <div className="relative w-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 1024 1024"
          className="w-6 h-6 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <path d="M0 0h1024v1024H0z" fill="none" />
          <path
            fill="currentColor"
            d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1S492.1 112 412 112s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6M570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4"
          />
        </svg>

        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-3 pl-12 pr-10 text-sm focus:outline-none focus:border-blue-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg text-gray-700 font-bold">Recent Posts</h1>
        {searchTerm && (
          <span className="text-xs text-gray-500">
            Found {filteredPosts.length} post (s)
          </span>
        )}
      </div>
      {filteredPosts.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-gray-300">
          No posts found
        </div>
      ) : (
        filteredPosts.map((post) => (
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
        ))
      )}
    </div>
  );
}

export default Home;
