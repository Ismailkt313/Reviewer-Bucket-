"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/app/utils/api";

type ReviewerRequest = {
  id: string;
  reviewerName: string;
  reviewerCode: string;
  type: "create" | "update";
  targetReviewerId?: string;
  batch?: string;
  stacks?: string[];
  status: "pending" | "approved" | "rejected" | "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
};

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReviewerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  
  // Rejection dialog states
  const [rejectingRequest, setRejectingRequest] = useState<ReviewerRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/reviewers/requests"), { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setRequests(json.data || []);
      } else {
        setError(json.message || "Failed to load requests.");
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: string) => {
    if (actioningId) return;
    setActioningId(id);
    try {
      const res = await fetch(getApiUrl(`/api/reviewers/requests/${id}/approve`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewedBy: "Admin" })
      });
      const json = await res.json();
      if (res.ok) {
        showToast("Request approved successfully!", "success");
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: "Admin" } : r))
        );
      } else {
        showToast(json.message || "Approval failed.", "error");
      }
    } catch {
      showToast("Network error occurred.", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleOpenRejectDialog = (req: ReviewerRequest) => {
    setRejectingRequest(req);
    setRejectionReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRequest || actioningId) return;
    const targetId = rejectingRequest.id;
    setActioningId(targetId);
    try {
      const res = await fetch(getApiUrl(`/api/reviewers/requests/${targetId}/reject`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim() || undefined,
          reviewedBy: "Admin"
        })
      });
      const json = await res.json();
      if (res.ok) {
        showToast("Request rejected successfully.", "success");
        setRequests((prev) =>
          prev.map((r) =>
            r.id === targetId
              ? {
                  ...r,
                  status: "rejected",
                  rejectionReason: rejectionReason.trim() || undefined,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: "Admin"
                }
              : r
          )
        );
        setRejectingRequest(null);
      } else {
        showToast(json.message || "Rejection failed.", "error");
      }
    } catch {
      showToast("Network error occurred.", "error");
    } finally {
      setActioningId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 animate-slide-up-fade">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-center text-white ${
              toast.type === "success" ? "bg-emerald-600 dark:bg-emerald-500" : "bg-red-600 dark:bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reviewer Requests</h1>
            <p className="text-sm text-secondary mt-1">
              Approve pending reviewer requests to publish them or reject duplicates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="self-start inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-xs font-bold text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shadow-xs"
          >
            Back to Home
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
            <p className="text-sm text-secondary">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-border rounded-2xl bg-surface">
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
            <button
              onClick={fetchRequests}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-accent text-background px-4 text-xs font-bold transition-opacity hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center border border-border rounded-2xl bg-surface select-none">
            <p className="text-sm text-secondary font-semibold">No requests found</p>
            <p className="text-xs text-muted mt-1">All reviewer approval submissions are clean.</p>
          </div>
        ) : (
          /* Requests Table/List */
          <div className="border border-border rounded-2xl overflow-hidden bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/30 text-xs font-bold tracking-wider text-secondary uppercase select-none">
                    <th className="px-6 py-4">Reviewer Details</th>
                    <th className="px-6 py-4">Batch</th>
                    <th className="px-6 py-4">Requested Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              req.type === "update"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {req.type || "CREATE"}
                          </span>
                          <div className="font-semibold text-foreground">{req.reviewerName}</div>
                        </div>
                        <div className="text-xs text-secondary">Code: {req.reviewerCode}</div>
                        {req.type === "update" && req.targetReviewerId && (
                          <div className="text-[11px] text-muted mt-0.5">Target Reviewer ID: {req.targetReviewerId}</div>
                        )}
                        {req.stacks && req.stacks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {req.stacks.map((stack) => (
                              <span
                                key={stack}
                                className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] text-secondary font-medium"
                              >
                                {stack}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary">{req.batch || "—"}</td>
                      <td className="px-6 py-4 text-secondary">{formatDate(req.requestedAt)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            req.status.toLowerCase() === "approved"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : req.status.toLowerCase() === "rejected"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {req.status}
                        </span>
                        {req.status.toLowerCase() === "rejected" && req.rejectionReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={req.rejectionReason}>
                            Reason: {req.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status.toLowerCase() === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={actioningId !== null}
                              onClick={() => handleApprove(req.id)}
                              className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3.5 text-xs font-bold transition-colors"
                            >
                              {actioningId === req.id ? "..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={actioningId !== null}
                              onClick={() => handleOpenRejectDialog(req)}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 disabled:opacity-40 px-3.5 text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted select-none">
                            Reviewed at {req.reviewedAt ? formatDate(req.reviewedAt) : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reasons Dialog */}
      {rejectingRequest && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRejectingRequest(null)}
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl animate-scale-in p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-foreground">Reject Reviewer Request</h3>
              <p className="text-xs text-secondary mt-1">
                Provide an optional reason for rejecting the request for <strong>{rejectingRequest.reviewerName}</strong>.
              </p>
            </div>
            <div>
              <label htmlFor="rejection-reason" className="sr-only">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                placeholder="Reason (e.g. Duplicate info, incorrect code format...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neutral-400 focus:outline-none dark:focus:border-neutral-500 resize-none"
              />
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actioningId !== null}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center justify-center"
              >
                {actioningId ? "..." : "Reject Request"}
              </button>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="flex-1 h-10 rounded-xl border border-border bg-background text-foreground font-semibold text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
