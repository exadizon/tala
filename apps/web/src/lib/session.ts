import { auth } from "./auth";
import { NextRequest } from "next/server";

export async function getSession(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return null;
  }

  return session;
}

export async function requireSession(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
