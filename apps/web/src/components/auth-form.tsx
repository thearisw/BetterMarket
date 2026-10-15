"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

// Shared by /sign-in and /sign-up; the only difference is the name field and endpoint.
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "sign-up";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    setPending(true);
    setError(null);
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name: String(form.get("name")) })
      : await authClient.signIn.email({ email, password });
    setPending(false);

    if (error) return setError(error.message ?? "Something went wrong");
    router.push("/");
    router.refresh();
  }

  const input = "w-full rounded-lg border border-line bg-surface px-3 py-2";

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="font-display text-2xl font-bold">{isSignUp ? "Create an account" : "Sign in"}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {isSignUp && (
          <label className="block space-y-1">
            <span className="text-sm text-muted">Name</span>
            <input name="name" required autoComplete="name" className={input} />
          </label>
        )}
        <label className="block space-y-1">
          <span className="text-sm text-muted">Email</span>
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className={input}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          disabled={pending}
          className="w-full rounded-lg bg-accent px-4 py-2 font-bold text-surface disabled:opacity-60"
        >
          {pending ? "…" : isSignUp ? "Sign up" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-muted">
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="text-accent underline">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
