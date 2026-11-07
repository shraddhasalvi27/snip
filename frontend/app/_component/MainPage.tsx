"use client";
import { useState } from "react";
import Logo from "./logo";
import { createLink } from "../axios";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/handle-error";

const inputClass =
  "min-w-0 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20";

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
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-black">
      <main className="w-full max-w-xl">
        <div className="mb-8">
          <Logo />
        </div>

        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Make a long link short
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Paste your link below and get a short one you can share.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateShortLink()}
            placeholder="https://example.com/very/long/link"
            aria-label="Link to shorten"
            className={inputClass}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label
                htmlFor="alias"
                className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400"
              >
                Custom alias (optional)
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
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="expires"
                className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400"
              >
                Expires on (optional)
              </label>
              <input
                id="expires"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            onClick={handleCreateShortLink}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {shortLink && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <a
              href={shortLink}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
            >
              {shortLink}
            </a>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}