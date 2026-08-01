import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./socket/SocketProvider"
import { NotificationProvider } from "./context/NotificationContext";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <>
    <Toaster position="top-center" reverseOrder={true} toastOptions={{
      duration: 3000,
      style: {
        background: "#333",
        color: "#fff",
      },
    }}
    />
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </>,
  // </StrictMode>,
);
