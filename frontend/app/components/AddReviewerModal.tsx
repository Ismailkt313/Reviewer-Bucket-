"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Check, ChevronDown, Search, Loader2, Plus } from "lucide-react";
import { getApiUrl } from "@/app/utils/api";

const ALLOWED_STACKS = [
  "MERN",
  "Data Science",
  "AI/ML",
  "Media",
  "Flutter",
  "Golang",
  "Python",
  "QA Team",
  "Game Development (Unity)",
  "Game Development (Unreal)"
] as const;

type AddReviewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reviewer: {
    id: string;
    name: string;
    code: string;
    slug: string;
    stacks: string[];
  }) => void;
  initialName?: string;
  initialCode?: string;
  focusField?: "name" | "code";
  mode?: "add" | "edit";
  reviewerId?: string;
  initialStacks?: string[];
};

export default function AddReviewerModal({
  isOpen,
  onClose,
  onSuccess,
  initialName = "",
  initialCode = "",
  focusField = "name",
  mode = "add",
  reviewerId = "",
  initialStacks = []
}: AddReviewerModalProps) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [selectedStacks, setSelectedStacks] = useState<string[]>(initialStacks);
  const [stackSearch, setStackSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; code?: string; stacks?: string; general?: string }>({});
  const [toast, setToast] = useState<{ title: string; description?: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]), [role="combobox"]'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Focus designated input on open
    setTimeout(() => {
      if (focusField === "code") {
        const codeInput = document.getElementById("reviewer-code") as HTMLInputElement;
        codeInput?.focus();
      } else {
        nameInputRef.current?.focus();
      }
    }, 100);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, focusField]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setStackSearch("");
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDropdownOpen]);

  // Auto-scroll modal body when dropdown opens so the options list is fully visible above footer
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const timer = setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const resetForm = useCallback(() => {
    setName("");
    setCode("");
    setSelectedStacks([]);
    setStackSearch("");
    setErrors({});
    setIsDropdownOpen(false);
  }, []);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const trimmedName = name.trim().replace(/\s+/g, " ");
    const trimmedCode = code.trim();

    if (trimmedName && trimmedName.length > 100) {
      newErrors.name = "Name must be at most 100 characters.";
    }

    if (!trimmedCode) {
      newErrors.code = "Reviewer code is required.";
    } else if (trimmedCode.length > 20) {
      newErrors.code = "Code must be at most 20 characters.";
    }

    if (selectedStacks.length === 0) {
      newErrors.stacks = "Select at least one stack.";
    } else if (selectedStacks.length > 10) {
      newErrors.stacks = "Maximum 10 stacks allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const url = mode === "edit" ? getApiUrl(`/api/reviewers/${reviewerId}`) : getApiUrl("/api/reviewers");
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().replace(/\s+/g, " "),
          code: code.trim(),
          stacks: selectedStacks
        })
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          const errMsg = json.message || (mode === "edit"
            ? "An update request for this reviewer is already under review."
            : "Reviewer code already exists.");
          setErrors({ code: errMsg });
        } else {
          setErrors({ general: json.message || "Something went wrong. Please try again." });
        }
        return;
      }

      setToast(
        mode === "edit"
          ? {
              title: "Update request submitted successfully.",
              description: "Your requested changes have been received and are awaiting verification. Once approved, they will be reflected publicly."
            }
          : {
              title: "Reviewer request submitted successfully.",
              description: "Your reviewer request has been received and is awaiting verification. Once approved by our team, it will appear in the public reviewer list."
            }
      );
      resetForm();

      // Delay close so toast is visible briefly
      setTimeout(() => onClose(), 3500);
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) => {
      if (prev.includes(stack)) {
        return prev.filter((s) => s !== stack);
      }
      if (prev.length >= 10) return prev;
      return [...prev, stack];
    });
    setErrors((prev) => ({ ...prev, stacks: undefined }));
  };

  const removeStack = (stack: string) => {
    setSelectedStacks((prev) => prev.filter((s) => s !== stack));
  };

  const filteredStacks = ALLOWED_STACKS.filter((s) =>
    s.toLowerCase().includes(stackSearch.toLowerCase())
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setStackSearch("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredStacks.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredStacks.length) % Math.max(1, filteredStacks.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const activeStack = filteredStacks[activeIndex];
      if (activeStack) {
        toggleStack(activeStack);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] max-w-md w-full px-4 animate-slide-up-fade">
          <div className="bg-emerald-600 dark:bg-emerald-500 text-white px-5 py-4 rounded-2xl shadow-2xl text-left border border-emerald-500/20">
            <h3 className="font-bold text-[15px] flex items-center gap-2 mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
              </svg>
              {toast.title}
            </h3>
            {toast.description && (
              <p className="text-xs text-white/90 leading-relaxed font-normal pl-7">
                {toast.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="presentation"
      >
        {/* Modal */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-reviewer-title"
          className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl animate-scale-in max-h-[85vh] md:max-h-[80vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10 rounded-t-2xl flex-shrink-0">
            <h2 id="add-reviewer-title" className="text-base font-bold text-foreground">
              {mode === "edit" ? "Edit Reviewer" : "Request Reviewer"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* General error */}
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-medium px-3 py-2 rounded-lg">
                  {errors.general}
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="reviewer-name" className="block text-xs font-semibold text-secondary mb-1.5">
                  Reviewer Name (Optional)
                </label>
                <input
                  id="reviewer-name"
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Vipin"
                  maxLength={100}
                  className={`w-full h-11 rounded-xl border bg-background px-3.5 text-[16px] md:text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-focus/15 transition-colors ${
                    errors.name ? "border-red-400 dark:border-red-600" : "border-border focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                />
                {errors.name && <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">{errors.name}</p>}
              </div>

              {/* Code */}
              <div>
                <label htmlFor="reviewer-code" className="block text-xs font-semibold text-secondary mb-1.5">
                  Reviewer Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="reviewer-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const normalized = e.target.value.replace(/[\s-]/g, "").toUpperCase();
                    setCode(normalized);
                    if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder="e.g. BR64"
                  maxLength={20}
                  className={`w-full h-11 rounded-xl border bg-background px-3.5 text-[16px] md:text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-focus/15 transition-colors font-mono ${
                    errors.code ? "border-red-400 dark:border-red-600" : "border-border focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                />
                {errors.code && <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">{errors.code}</p>}
              </div>

              {/* Stacks */}
              <div ref={dropdownRef} className="relative pb-4">
                <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center justify-between">
                  <span>
                    Stack <span className="text-red-500">*</span>
                  </span>
                  {selectedStacks.length > 0 && (
                    <span className="text-[10px] text-muted font-normal">
                      {selectedStacks.length}/10 selected
                    </span>
                  )}
                </label>

                {/* Custom popover trigger containing selected chips */}
                <div
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  aria-controls="stack-listbox"
                  aria-haspopup="listbox"
                  tabIndex={0}
                  onClick={() => {
                    setIsDropdownOpen((prev) => !prev);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsDropdownOpen((prev) => !prev);
                    }
                  }}
                  className={`w-full min-h-[44px] flex flex-wrap gap-1.5 p-2 rounded-xl border bg-background text-sm cursor-pointer transition-all duration-200 items-center justify-between ${
                    isDropdownOpen
                      ? "border-accent ring-2 ring-accent/20 bg-neutral-50/50 dark:bg-neutral-850/50 shadow-sm"
                      : errors.stacks
                      ? "border-red-400 dark:border-red-600"
                      : "border-border hover:border-neutral-400 dark:hover:border-neutral-500"
                  } focus:outline-none focus:ring-2 focus:ring-accent/20`}
                >
                  {selectedStacks.length === 0 ? (
                    <span className="text-muted/60 px-1.5 select-none text-xs">
                      Select technology stacks...
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                      {selectedStacks.map((stack) => (
                        <span
                          key={stack}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStack(stack);
                          }}
                          className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-150 animate-scale-in hover:bg-accent/20"
                        >
                          {stack}
                          <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-accent/30 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180 text-accent" : "text-muted"
                    }`}
                  />
                </div>

                {/* Custom Popover Dropdown panel */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 border border-border/80 rounded-2xl bg-surface/98 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-40 flex flex-col max-h-[260px] w-full ring-1 ring-black/5 dark:ring-white/10">
                    {/* Sticky Search */}
                    <div className="px-3 py-2 border-b border-border/60 flex-shrink-0 bg-surface/90">
                      <div className="relative flex items-center">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={stackSearch}
                          onChange={(e) => {
                            setStackSearch(e.target.value);
                            setActiveIndex(0);
                          }}
                          onKeyDown={handleSearchKeyDown}
                          placeholder="Search stacks..."
                          className="w-full h-8 pl-8 pr-7 rounded-lg border border-border/60 bg-background text-[16px] md:text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
                        />
                        {stackSearch && (
                          <button
                            type="button"
                            onClick={() => setStackSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scrollable list options */}
                    <div role="listbox" id="stack-listbox" className="overflow-y-auto py-1 flex-1 space-y-0.5 px-1">
                      {filteredStacks.length > 0 ? (
                        filteredStacks.map((stack, idx) => {
                          const isSelected = selectedStacks.includes(stack);
                          const isDisabled = !isSelected && selectedStacks.length >= 10;
                          const isFocused = idx === activeIndex;
                          return (
                            <button
                              key={stack}
                              id={`stack-option-${idx}`}
                              role="option"
                              aria-selected={isSelected}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                toggleStack(stack);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                                isDisabled
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                              } ${
                                isSelected
                                  ? "bg-accent/10 text-accent font-semibold"
                                  : "text-foreground"
                              } ${
                                isFocused && !isSelected
                                  ? "bg-neutral-100 dark:bg-neutral-800 ring-1 ring-inset ring-border"
                                  : ""
                              }`}
                            >
                              <span className="flex-1 truncate">{stack}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-4 text-xs text-muted text-center">
                          No stacks matching &ldquo;{stackSearch}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {errors.stacks && <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">{errors.stacks}</p>}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="border-t border-border p-4 bg-surface flex-shrink-0 rounded-b-2xl">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-accent text-background text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "edit" ? "Saving..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    {mode === "edit" ? null : <Plus className="w-4 h-4" />}
                    {mode === "edit" ? "Save Changes" : "Request Reviewer"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
