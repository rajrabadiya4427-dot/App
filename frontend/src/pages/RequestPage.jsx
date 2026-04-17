import RequestList from "../components/RequestList";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


const RequestsPage = () => {
  const navigate = useNavigate();

  

  return (
    <div className="min-h-screen pt-16 px-3 sm:px-6 flex flex-col items-center w-full">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-2 text-sm sm:text-base text-base-content/70 hover:text-base-content transition-colors self-start max-w-2xl w-full"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      {/* Main Card */}
      <div className="w-full  min-h-100   p-4 sm:p-6 rounded-xl bg-blackshadow-md">
        <h1 className="text-lg sm:text-xl font-bold mb-4">Requests</h1>
        <RequestList />
      </div>
    </div>
  );
};

export default RequestsPage;