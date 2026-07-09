import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import MobileNavbar from "../components/common/MobileNavbar";
import Sidebar from "../components/sidebar/Sidebar";
import ChatList from "../components/sidebar/ChatList";
import GroupList from "../components/sidebar/GroupList";
import NewChat from "../components/sidebar/NewChat";
import AISection from "../components/sidebar/AISection";
import FriendList from "../components/sidebar/FriendList";
import AddFriend from "../components/sidebar/AddFriend";
import Conversation from "../components/chat/Conversation";
import useIsMobile from "../hooks/useIsMobile";
import AIChat from "../components/chat/AIChat";

export default function Home() {
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("Chats");
  const [creatingAIChat, setCreatingAIChat] = useState(false);

  useEffect(() => {
    if (
      activeTab !== "Chats" &&
      activeTab !== "Groups" &&
      activeTab !== "AI"
    ) {
      setSelectedChat(null);
    }
  }, [activeTab]);

  const renderLeftPanel = () => {
    switch (activeTab) {
      case "Chats":
        return (
          <ChatList
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
          />
        );

      case "Groups":
        return (
          <GroupList
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
          />
        );

      case "New Chat":
        return (
          <NewChat
            onSelectChat={setSelectedChat}
            setActiveTab={setActiveTab}
          />
        );

      case "AI":
        return (
          <AISection
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            onCreateChat={() => {
              setSelectedChat(null);
              setCreatingAIChat(true);
              setActiveTab("AI");
            }}
          />
        );

      case "Friends":
        return <FriendList />;

      case "Add Friend":
        return <AddFriend />;

      default:
        return null;
    }
  };

  const showConversation =
    activeTab === "Chats" || activeTab === "Groups" || activeTab === "AI";

  return isMobile ? (
    // ================= MOBILE =================
    <div className="h-dvh bg-slate-950 flex flex-col">
      {(!selectedChat && !creatingAIChat) ? (
        <>
          <MobileNavbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="flex-1 overflow-hidden pb-20">
            {renderLeftPanel()}
          </div>
        </>
      ) : activeTab === "AI" ? (
        <AIChat
          chat={selectedChat}
          creating={creatingAIChat}
          onChatCreated={(newChat) => {
            setSelectedChat(newChat);
            setCreatingAIChat(false);
          }}
          onBack={() => {
            setCreatingAIChat(false);
            setSelectedChat(null);
          }}
        />
      ) : (
        <Conversation
          chat={selectedChat}
          onBack={() => setSelectedChat(null)}
        />
      )}
    </div>
  ) : (
    // ================= DESKTOP =================
    <div className="h-screen bg-slate-950 p-4 lg:p-5 flex flex-col gap-4">
      <Navbar />

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="w-[320px] lg:w-90 xl:w-100 2xl:w-107.5 rounded-2xl overflow-hidden shrink-0">
          {renderLeftPanel()}
        </div>

        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden">
          {showConversation ? (
            activeTab === "AI" ? (
              <AIChat
                chat={selectedChat}
                creating={creatingAIChat}
                onChatCreated={(newChat) => {
                  setSelectedChat(newChat);
                  setCreatingAIChat(false);
                }}
                onBack={() => {
                  setCreatingAIChat(false);
                  setSelectedChat(null);
                }}
              />
            ) : (
              <Conversation
                chat={selectedChat}
                onBack={() => setSelectedChat(null)}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">
                  {activeTab}
                </h2>

                <p className="mt-2 text-gray-400">
                  Select an option from the left panel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
