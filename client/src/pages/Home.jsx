import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import MobileNavbar from "../components/common/MobileNavbar";
import Sidebar from "../components/sidebar/Sidebar";
import ChatList from "../components/sidebar/ChatList";
import GroupList from "../components/sidebar/GroupList";
import NewChat from "../components/sidebar/NewChat";
import AISection from "../components/sidebar/AISection";
import AddFriend from "../components/sidebar/AddFriend";
import Conversation from "../components/chat/Conversation";
import useIsMobile from "../hooks/useIsMobile";
import AIChat from "../components/chat/AIChat";
import api from "../api/axois";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams();
  const isMobile = useIsMobile();

  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("Chats");

  const [aiChats, setAiChats] = useState([]);
  const [loadingAIChats, setLoadingAIChats] = useState(true);

  // URL is now the source of truth
  const isAIHome = location.pathname === "/home/ai";
  const isAINew = location.pathname === "/home/ai/new";
  const isAIChat =
    location.pathname.startsWith("/home/ai/") && !isAINew;

  const creatingAIChat = isAINew;

  const fetchAIChats = async () => {
    try {
      setLoadingAIChats(true);

      const res = await api.get("/ai/chat");

      const chats = res.data.data;
      setAiChats(chats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAIChats(false);
    }
  };

  useEffect(() => {
    fetchAIChats();
  }, []);

  // Sync active tab with URL
  useEffect(() => {
    if (location.pathname.startsWith("/home/ai")) {
      setActiveTab("AI");
    } else if (location.pathname.startsWith("/home/chat")) {
      setActiveTab("Chats");
    } else if (location.pathname.startsWith("/home/group")) {
      setActiveTab("Groups");
    }
  }, [location.pathname]);

  // Update selected AI chat whenever URL changes
  useEffect(() => {
    if (isAIHome) {
      setSelectedChat(null);
      return;
    }

    if (!chatId || aiChats.length === 0) return;

    const chat = aiChats.find((c) => c._id === chatId);

    if (chat) {
      setSelectedChat(chat);
    } else {
      setSelectedChat(null);
    }
  }, [chatId, aiChats, isAIHome]);

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
            chats={aiChats}
            loading={loadingAIChats}
            selectedChat={selectedChat}
            onSelectChat={(chat) => {
              navigate(`/home/ai/${chat._id}`);
            }}
            onCreateChat={() => {
              navigate("/home/ai/new");
            }}
          />
        );

      case "Add Friend":
        return <AddFriend />;

      default:
        return null;
    }
  };

  const showConversation =
    isAIChat ||
    isAINew ||
    location.pathname.startsWith("/home/chat/") ||
    location.pathname.startsWith("/home/group/");

  return isMobile ? (
    <div className="h-dvh bg-slate-950 flex flex-col">
      {!showConversation ? (
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
            setAiChats((prev) => [newChat, ...prev]);
            fetchAIChats();
            navigate(`/home/ai/${newChat._id}`);
          }}
          onBack={() => {
            navigate("/home/ai");
          }}
        />
      ) : (
        <Conversation
          chat={selectedChat}
          onBack={() => {
            navigate("/home");
          }}
        />
      )}
    </div>
  ) : (
    <div className="h-screen bg-slate-950 p-4 lg:p-5 flex flex-col gap-4">
      <Navbar />

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="w-[320px] lg:w-90 xl:w-100 2xl:w-107.5 rounded-2xl overflow-hidden shrink-0">
          {renderLeftPanel()}
        </div>

        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden all-scroll">
          {showConversation ? (
            activeTab === "AI" ? (
              <AIChat
                chat={selectedChat}
                creating={creatingAIChat}
                onChatCreated={(newChat) => {
                  setAiChats((prev) => [newChat, ...prev]);

                  // Refresh sidebar with latest chat data
                  fetchAIChats();

                  // Open the newly created chat
                  navigate(`/home/ai/${newChat._id}`);
                }}
                onBack={() => {
                  navigate("/home/ai");
                }}
              />
            ) : (
              <Conversation
                chat={selectedChat}
                onBack={() => {
                  navigate("/home");
                }}
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
  )
}
