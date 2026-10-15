"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
      className="rounded-lg border border-line px-3 py-1.5 hover:bg-surface"
    >
      Sign out
    </button>
  );
}
