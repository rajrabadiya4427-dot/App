import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { User2Icon } from "lucide-react";
import InviteUser from "./InviteUser";
import { useNavigate } from "react-router-dom";
import RequestList from "./RequestList";
import { MoreVertical, UserMinus } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = Array.isArray(users)
    ? showOnlineOnly
      ? users.filter((user) => onlineUsers.includes(user._id))
      : users
    : [];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <User2Icon className="size-6" />
          <span className="font-medium  lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>

        <div className="flex gap-2 w-[50%] mt-2">
          <button
            className="btn btn-sm btn-primary w-1/2"
            onClick={() => setShowInvite(true)}
          >
            Invite
          </button>

          <button
            className="btn btn-sm btn-secondary w-1/2"
            onClick={() => navigate("/requests")}
          >
            Requests
          </button>
        </div>
      </div>

      {showInvite && (
        <div className="p-3 border-b border-base-300">
          <InviteUser />
          <button
            className="btn btn-xs mt-2"
            onClick={() => setShowInvite(false)}
          >
            Close
          </button>
        </div>
      )}

      {showRequests && (
        <div className="p-3 border-b border-base-300">
          <RequestList />
          <button
            className="btn btn-xs mt-2"
            onClick={() => setShowRequests(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className="overflow-y-auto w-full min-h-full userss  py-3">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`
      w-full p-3 flex items-center justify-between gap-3
      hover:bg-base-300 transition-colors
      ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
    `}
          >
            {/* LEFT SIDE: Avatar + Name (clickable to select chat) */}
            <button
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left"
            >
              <div className="relative shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <div className="hidden lg:block min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>

            {/* RIGHT SIDE: Three-dot menu */}
            <div className="dropdown dropdown-end shrink-0">
              <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <MoreVertical className="w-4 h-4" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40"
              >
                <li>
                  <button
                    onClick={async () => {
                      try {
                        await axios.delete(`/api/requests/friend/${user._id}`, {
                          withCredentials: true,
                        });
                        toast.success(`${user.fullName} removed from friends`);
                        getUsers(); // refresh sidebar
                        if (selectedUser?._id === user._id)
                          setSelectedUser(null);
                      } catch (error) {
                        toast.error("Failed to remove friend");
                      }
                    }}
                    className="text-error"
                  >
                    <UserMinus className="w-4 h-4" />
                    Delete Friend
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
export default Sidebar;
