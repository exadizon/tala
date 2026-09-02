export * from "./types";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return api<T>(path, { method: "GET" });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return api<T>(path, { method: "DELETE" });
}
