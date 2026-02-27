import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "AI Native Club - The club for AI-native builders";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0908",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232, 168, 73, 0.15) 0%, transparent 50%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#e8a849",
            marginBottom: 24,
            fontFamily: "monospace",
          }}
        >
          {">_"}
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#f5f5f4",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          AI Native Club
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 28,
            color: "#a3a3a3",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          The club for AI-native builders.
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: 22,
            color: "#e8a849",
            textAlign: "center",
          }}
        >
          50K-2M ARR · Technical founders who ship
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
