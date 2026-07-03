import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import MobileNavbar from "../components/common/MobileNavbar";
import Sidebar from "../components/sidebar/Sidebar";
import ChatList from "../components/sidebar/ChatList";
import Conversation from "../components/chat/Conversation";

export default function Home() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <>
      {/* ================= MOBILE ================= */}
      <div className="md:hidden h-screen bg-slate-950 flex flex-col">
        {!selectedChat ? (
          <>
            <MobileNavbar />

            <div className="flex-1 overflow-hidden">
              <ChatList
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            </div>
          </>
        ) : (
          <Conversation
            chat={selectedChat}
            onBack={() => setSelectedChat(null)}
          />
        )}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:flex h-screen bg-slate-950 p-3 flex-col gap-3">
        <Navbar />

        <div className="flex flex-1 gap-3 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Chat List */}
          <div className="w-80 rounded-2xl overflow-hidden">
            <ChatList
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
            />
          </div>

          {/* Conversation */}
          <div className="flex-1 rounded-2xl overflow-hidden">
            <Conversation
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
            />
          </div>
        </div>
      </div>
    </>
  );
}