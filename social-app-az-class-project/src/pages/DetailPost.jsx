import { useParams } from "react-router";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import CommentSession from "../components/CommentSession";
import { API_URL, authFetch } from "../services/api";

export default function DetailPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    authFetch(`${API_URL}/posts/${id}`)
      .then((response) => response.json())
      .then((result) => {
        setPost(result);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="max-w-3xl mx-auto text-center p-4">Loading..</div>;

  if (!post) {
    return <div className="max-w-3xl mx-auto p-4 ">No post to show</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <PostCard
        id={post._id}
        title={post.title}
        author={post.author}
        description={post.body}
        imageUrl={post.imageUrl}
        showDetailsLink={false}
        likeCounts={post.likesCount}
        initialIsLiked={post.isLiked}
        initialIsSaved={post.isSaved}
      />

      <CommentSession postId={post._id} />
    </div>
  );
}
