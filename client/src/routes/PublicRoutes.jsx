import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Loader from "../components/common/Loader";

export default function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader size="lg" overlay={true} />;

  return user ? <Navigate to="/home" replace /> : children;
}
