import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Loader from "../components/common/Loader";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loader size="lg" overlay={true} />;

  return user ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;
