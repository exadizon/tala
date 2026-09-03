"use client";

import { useState, useCallback, useEffect } from "react";
import { UserCircle, Key, Loader2, Copy, Check, LogOut, CheckCircle2 } from "lucide-react";

import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [newTokenRaw, setNewTokenRaw] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const fetchTokens = useCallback(async () => {
    setIsLoadingTokens(true);
    try {
      const res = await fetch("/api/settings/tokens");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
      }
    } finally {
      setIsLoadingTokens(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/settings/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName.trim() }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewTokenRaw(data.token);
        setTokenName("");
        await fetchTokens();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm("Are you sure you want to revoke this API token? Any apps using it will immediately stop working.")) return;
    try {
      const res = await fetch(`/api/settings/tokens/${tokenId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTokens();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const wrapCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-12 animate-fade-in pb-20">
      <header className="border-b border-[var(--faint)] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[var(--muted)] font-sans mt-2">
          Manage your account preferences and API access.
        </p>
      </header>

      {/* Account Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-[var(--ink)]">
          <UserCircle className="w-5 h-5 text-[var(--muted)]" />
          <h2 className="font-serif text-xl font-medium">Account</h2>
        </div>
        
        <div className="rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-sm font-medium text-[var(--ink)]">Sign out of Tala</h3>
                 <p className="text-xs text-[var(--muted)] mt-1">Clear your session on this device.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    // Try our native auth logout, or via BetterAuth client hook
                    // We can just redirect to basic /api/auth/signout or use BetterAuth client
                    const res = await fetch('/api/auth/sign-out', { method: 'POST' });
                    window.location.href = '/login';
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 bg-[var(--panel)] hover:bg-[var(--faint)] border border-[var(--faint)] text-[var(--ink)] rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
           </div>
        </div>
      </section>

      {/* API Tokens Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-[var(--ink)]">
          <Key className="w-5 h-5 text-[var(--muted)]" />
          <h2 className="font-serif text-xl font-medium">Developer Settings</h2>
        </div>

        <div className="rounded-2xl border border-[var(--faint)] bg-[var(--paper)] overflow-hidden">
          <div className="p-6 border-b border-[var(--faint)]">
            <h3 className="text-sm font-medium text-[var(--ink)] mb-1">API Tokens</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-lg mb-6">
              Generate tokens to connect the upcoming Tala browser extension or use the REST API directly. Tokens grant full access to your library.
            </p>

            <form onSubmit={handleGenerate} className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Token name (e.g., Arc Browser Extension)"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
                className="flex-1 rounded-xl border border-[var(--faint)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={isGenerating || !tokenName.trim()}
                className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-sm font-medium shadow-xs hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
              </button>
            </form>

            {/* Display newly generated token */}
            {newTokenRaw && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Token generated successfully</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 mb-3">
                        Make sure to copy your personal API token now. You won't be able to see it again!
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white dark:bg-black px-3 py-2 rounded-lg text-xs font-mono border border-emerald-200 dark:border-emerald-800 break-all select-all">
                          {newTokenRaw}
                        </code>
                        <button
                          onClick={() => wrapCopy(newTokenRaw)}
                          className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-colors"
                        >
                          {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Tokens List */}
          <div className="p-0">
            {isLoadingTokens ? (
               <div className="py-8 flex justify-center">
                 <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
               </div>
            ) : tokens.length === 0 ? (
               <div className="py-8 text-center text-sm text-[var(--muted)] px-6">
                  No active API tokens found.
               </div>
            ) : (
               <ul className="divide-y divide-[var(--faint)]">
                 {tokens.map((token) => (
                    <li key={token.id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                       <div>
                         <p className="text-sm font-medium text-[var(--ink)]">{token.name}</p>
                         <p className="text-xs font-mono text-[var(--muted)] mt-1">
                           Created {new Date(token.createdAt).toLocaleDateString()}
                         </p>
                       </div>
                       <button
                         onClick={() => handleRevoke(token.id)}
                         className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                       >
                         Revoke
                       </button>
                    </li>
                 ))}
               </ul>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

