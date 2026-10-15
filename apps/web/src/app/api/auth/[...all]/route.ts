import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Better Auth serves sign-up, sign-in, sign-out and session endpoints under /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth);
