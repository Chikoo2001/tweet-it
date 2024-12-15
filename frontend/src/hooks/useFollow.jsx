import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

const useFollow = () => {
  const queryClient = useQueryClient();
  const {
    mutate: followOrUnfollow,
    isLoading,
    error,
    isError,
  } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/user/follow/${userId}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  return {followOrUnfollow, isLoading};
};

export default useFollow;
