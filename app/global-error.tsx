"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{ color: "#00D9E0", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}
          >
            Something broke
          </p>
          <h1 style={{ fontSize: 32, lineHeight: 1.1, margin: "12px 0" }}>
            The site failed to load.
          </h1>
          <p style={{ color: "#B4BCCC" }}>Please try again in a moment.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: "#00D9E0",
              color: "#000",
              border: 0,
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
