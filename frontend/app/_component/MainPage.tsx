"use client";
import { useState } from "react";
import Logo from "./logo";
import { createLink } from "../axios";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/handle-error";

const fieldClass =
  "w-full min-w-0 rounded-2xl border border-violet-200/70 bg-violet-50/60 px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-200/60";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-700";

const perks = [
  { title: "Custom names", text: "Pick a short name people can remember.", tint: "bg-emerald-100" },
  { title: "Expiry dates", text: "Links stop working on the day you choose.", tint: "bg-amber-100" },
  { title: "Free to use", text: "No account needed to create a link.", tint: "bg-sky-100" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [date, setDate] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleCreateShortLink = async () => {
    setError("");
    setShortLink("");
    setCopied(false);

    if (!url.trim()) return setError("Paste a link to shorten.");

    setLoading(true);
    try {
      const payload = {
        url: url.trim(),
        // optional fields: only send them when filled in
        ...(alias.trim() && { alias: alias.trim() }),
        ...(date && { expiresAt: new Date(`${date}T23:59:59`).toISOString() }),
      };
      const res = await createLink(payload);
      setShortLink(res.data.shortUrl);
      toast.success("Link created successfully");
    } catch (error) {
      getErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Select the link and copy it manually.");
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f6f3ff] font-sans text-zinc-900">
      {/* header: logo top-left */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-sm shadow-violet-200/60">
          Free, no sign-up
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-5 pb-16 pt-12 sm:px-8 sm:pt-20">
        <h1 className="max-w-2xl text-balance text-center text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 sm:text-6xl">
          Make a long link short
        </h1>
        <p className="mt-5 max-w-md text-pretty text-center text-base leading-relaxed text-zinc-600 sm:text-lg">
          Paste a link, name it, set an expiry if you want, and share it anywhere.
        </p>

        {/* form */}
        <div className="mt-10 w-full max-w-2xl rounded-3xl bg-white p-4 shadow-xl shadow-violet-200/50 sm:p-6">
          <label htmlFor="url" className="sr-only">
            Link to shorten
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="url"
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateShortLink()}
              placeholder="https://example.com/very/long/link"
              className={`${fieldClass} py-3.5 text-base`}
            />
            <button
              onClick={handleCreateShortLink}
              disabled={loading}
              className="shrink-0 rounded-2xl bg-violet-300 px-7 py-3.5 font-semibold text-violet-950 transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Shortening…" : "Shorten"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="alias" className={labelClass}>
                Custom name <span className="text-zinc-400">(optional)</span>
              </label>
              <input
                id="alias"
                type="text"
                value={alias}
                onChange={(e) =>
                  setAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreateShortLink()}
                placeholder="my-link"
                maxLength={30}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="expires" className={labelClass}>
                Expires on <span className="text-zinc-400">(optional)</span>
              </label>
              <input
                id="expires"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className={`${fieldClass} [color-scheme:light]`}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-100 px-4 py-2.5 text-sm text-rose-800">
              {error}
            </p>
          )}

          {shortLink && (
            <div
              aria-live="polite"
              className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-100 p-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-emerald-800">Your short link is ready</p>
                <a
                  href={shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-lg font-semibold text-emerald-950 underline-offset-4 hover:underline"
                >
                  {shortLink}
                </a>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* perks */}
       
      </main>
    </div>
  );
}