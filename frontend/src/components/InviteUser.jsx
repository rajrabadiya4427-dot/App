import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const InviteUser = () => {
  const [mobile, setMobile] = useState("");
const { sendRequest } = useAuthStore();

const handleInvite = () => {
  if (!mobile) return;
  sendRequest(mobile);
  setMobile("");
};

  return (
    <div className="p-4 w-50">
      <input
        type="text"
        placeholder="Enter mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        className="input input-bordered w-full"
      />
      <button className="btn btn-primary mt-2" onClick={handleInvite}>
        Invite
      </button>
    </div>
  );
};

export default InviteUser;