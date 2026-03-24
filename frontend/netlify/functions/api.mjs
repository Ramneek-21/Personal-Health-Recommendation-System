function getBackendOrigin() {
  const value =
    globalThis.Netlify?.env?.get?.("BACKEND_ORIGIN") ||
    process.env.BACKEND_ORIGIN ||
    "";

  return value.replace(/\/+$/, "");
}

function buildTargetUrl(requestUrl, backendOrigin) {
  const incomingUrl = new URL(requestUrl);
  return `${backendOrigin}${incomingUrl.pathname}${incomingUrl.search}`;
}

function copyRequestHeaders(requestHeaders, requestUrl) {
  const headers = new Headers(requestHeaders);
  const incomingUrl = new URL(requestUrl);

  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  return headers;
}

function buildErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({ detail: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request) {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return buildErrorResponse(
      "Missing BACKEND_ORIGIN configuration for the Netlify API proxy."
    );
  }

  const method = request.method.toUpperCase();
  const targetUrl = buildTargetUrl(request.url, backendOrigin);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers: copyRequestHeaders(request.headers, request.url),
      body: method === "GET" || method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });

    const headers = new Headers(upstreamResponse.headers);
    headers.delete("content-length");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    return buildErrorResponse(
      `Backend proxy request failed: ${error instanceof Error ? error.message : "unknown error"}`,
      502
    );
  }
}

export const config = {
  path: "/api/*",
};

