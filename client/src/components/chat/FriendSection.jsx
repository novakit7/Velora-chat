import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";
import api from "../../api/axois";
import { notify } from "../../utils/toast";
import { formatRelativeDate } from "../../utils/date";
import Loader from "../common/Loader";

export default function FriendSection() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const handleRequests = async () => {
    try {
      setLoading(true);
      const received = await api.get("/friend-request/received");
      const sent = await api.get("/friend-request/sent");
      setSentRequests(sent.data.data);
      console.log(received.data.data)
      setIncomingRequests(received.data.data);
    } catch (error) {
      console.log(error);
      notify.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleRequests();
  }, []);

  const acceptRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      await api.patch(`/friend-request/accept/${requestId}`);

      setIncomingRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      notify.success("Friend request accepted");
    } catch (error) {
      console.log(error);

      notify.error(
        error?.response?.data?.message ||
        "Failed to accept request"
      );
    } finally {
      setActionLoading(null);
    }
  };
  const rejectRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      await api.delete(`/friend-request/reject/${requestId}`);

      setIncomingRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      notify.success("Friend request rejected");
    } catch (error) {
      console.log(error);

      notify.error(
        error?.response?.data?.message ||
        "Failed to reject request"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      setActionLoading(requestId);

      await api.delete(`/friend-request/cancel/${requestId}`);

      setSentRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );

      notify.success("Request cancelled");
    } catch (error) {
      console.log(error);

      notify.error(
        error?.response?.data?.message ||
        "Failed to cancel request"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => navigate("/home/add-friend")}
              className="text-white"
            >
              <FiArrowLeft size={22} />
            </button>
          )}

          <div>
            <h2 className="text-xl font-semibold text-white">
              Friend Requests
            </h2>

            <p className="text-sm text-slate-400">
              Manage incoming and pending requests.
            </p>
          </div>
        </div>
      </div>
      {loading ? (<div className="relative flex h-full items-center justify-center">
        <Loader variant="section" />
      </div>) :
        (
          <div className="flex-1 space-y-8 overflow-y-auto p-5 all-scroll">
            {/* Incoming */}
            <section className="flex flex-col">
              <div className="mb-5 flex items-center">
                <div className="flex items-center gap-2">
                  <FiUserPlus className="text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Incoming Requests
                  </h3>
                </div>

                <span className="ml-auto rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-medium text-cyan-400">
                  {incomingRequests.length}
                </span>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 py-12 text-center">
                  <FiUserPlus className="mx-auto mb-3 text-3xl text-slate-600" />
                  <p className="text-slate-400">
                    No incoming friend requests.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-xl border border-slate-800 bg-slate-800 p-4 transition hover:border-cyan-500/40"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={request.sender?.avatar?.url}
                          alt={request.sender?.username}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-700"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-white">
                            {request.sender?.username}
                          </h4>

                          <p className="truncate text-sm text-slate-400">
                            {request.sender?.fullName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {request.sender?.email}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Received {formatRelativeDate(request.createdAt)} ago
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          onClick={() => acceptRequest(request._id)}
                          disabled={actionLoading === request._id}
                          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === request._id ? (
                            <Loader variant="button" />
                          ) : (
                            <>
                              <FiCheck />
                              Accept
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => rejectRequest(request._id)}
                          disabled={actionLoading === request._id}
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <FiX />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pending Requests */}
            <section className="flex flex-col">
              <div className="mb-5 flex items-center">
                <div className="flex items-center gap-2">
                  <FiClock className="text-yellow-400" />

                  <h3 className="text-lg font-semibold text-white">
                    Pending Requests
                  </h3>
                </div>

                <span className="ml-auto rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs font-medium text-yellow-400">
                  {sentRequests.length}
                </span>
              </div>

              {sentRequests.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 py-12 text-center">
                  <FiClock className="mx-auto mb-3 text-3xl text-slate-600" />
                  <p className="text-slate-400">
                    No pending friend requests.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-xl border border-slate-800 bg-slate-800 p-4 transition hover:border-yellow-500/40"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={request.receiver?.avatar?.url}
                          alt={request.receiver?.username}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-700"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold text-white">
                            {request.receiver?.username}
                          </h4>

                          <p className="truncate text-sm text-slate-400">
                            {request.receiver?.fullName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {request.receiver?.email}
                          </p>

                          <p className="mt-1 text-xs text-yellow-400">
                            Sent {formatRelativeDate(request.createdAt)} ago
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => cancelRequest(request._id)}
                        disabled={actionLoading === request._id}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading === request._id ? (
                          <Loader variant="button" />
                        ) : (
                          <>
                            <FiX />
                            Cancel Request
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
    </div>
  );
}