import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const RequestList = () => {
  const { requests, getRequests, acceptRequest } = useAuthStore();

  useEffect(() => {
    getRequests();
  }, [getRequests]);

  return (
    <div className="space-y-3">
      {(requests || []).map((req) => (
        <div
          key={req._id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-base-200"
        >
          {/* Name */}
          <span className="text-sm sm:text-base ">
            {req.senderId?.FullName}
          </span>

          {/* Button */}
          <button
            className="btn btn-xs sm:btn-sm btn-primary w-full sm:w-auto"
            onClick={() => acceptRequest(req._id)}
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};

export default RequestList;