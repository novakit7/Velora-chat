import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // URL is now the source of truth
  const isAIHome = location.pathname === "/home/ai";
  const isAINew = location.pathname === "/home/ai/new";
  const isAIChat =
    location.pathname.startsWith("/home/ai/") && !isAINew;

  const creatingAIChat = isAINew;
  const isAIPage = location.pathname.startsWith("/home/ai");

  const renderLeftPanel = () => {
    if (location.pathname.startsWith("/home/ai")) {
      return (
        <AISection
          onCreateChat={() => navigate("/home/ai/new")}
        />
      );
    }

    if (location.pathname.startsWith("/home/group")) {
      return (
        <GroupList />
      );
    }

    if (location.pathname.startsWith("/home/new-chat")) {
      return (
        <NewChat />
      );
    }

    if (location.pathname.startsWith("/home/add-friend")) {
      return <AddFriend />;
    }

    // Default
    return (
      <ChatList />
    );
  };
  const showConversation =
    isAIChat ||
    isAINew ||
    location.pathname.startsWith("/home/chat/") ||
    location.pathname.startsWith("/home/group/");

  const currentTab = isAIPage
    ? "AI"
    : location.pathname.startsWith("/home/group")
      ? "Groups"
      : location.pathname.startsWith("/home/new-chat")
        ? "New Chat"
        : location.pathname.startsWith("/home/add-friend")
          ? "Add Friend"
          : "Chats";

  return isMobile ? (
    <div className="h-dvh bg-slate-950 flex flex-col">
      {!showConversation ? (
        <>
          <MobileNavbar />

          <div className="flex-1 overflow-hidden pb-20">
            {renderLeftPanel()}
          </div>
        </>
      ) : isAIPage ? (
        <AIChat
          creating={creatingAIChat}
          onChatCreated={(newChat) => {
            navigate(`/home/ai/${newChat._id}`);
          }}
          onBack={() => navigate("/home/ai")}
        />
      ) : (
        <Conversation
          onBack={() => navigate("/home")}
        />
      )}
    </div>
  ) : (
    <div className="h-screen bg-slate-950 p-4 lg:p-5 flex flex-col gap-4">
      <Navbar />

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        <Sidebar />

        <div className="w-[320px] lg:w-90 xl:w-100 2xl:w-107.5 rounded-2xl overflow-hidden shrink-0">
          {renderLeftPanel()}
        </div>

        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden all-scroll">
          {showConversation ? (
            isAIPage ? (
              <AIChat
                creating={creatingAIChat}
                onChatCreated={(newChat) => {
                  navigate(`/home/ai/${newChat._id}`);
                }}
                onBack={() => navigate("/home/ai")}
              />
            ) : (
              <Conversation
                onBack={() => navigate("/home")}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">
                  {currentTab}
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