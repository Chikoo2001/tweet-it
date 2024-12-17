import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { useQuery } from "react-query";
import { useEffect } from "react";

const Posts = ({ feedType, userId }) => {
  const getPostEndPoint = () => {
    switch (feedType) {
      case "feed":
        return "/api/posts/";
      case "following":
        return "/api/posts/following";
      case "posts":
        return "/api/posts/user/" + userId;
      case "likes":
        return "/api/posts/liked/" + userId;
      default:
        return "/api/posts/";
    }
  };

  const POST_ENDPOINT = getPostEndPoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        console.log(data);
        return data?.posts || [];
      } catch (error) {
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, userId]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
