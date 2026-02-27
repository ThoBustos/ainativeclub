import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: "#0a0908",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8a849",
          fontFamily: "monospace",
          fontWeight: 700,
          borderRadius: 32,
        }}
      >
        {">"}_
      </div>
    ),
    {
      ...size,
    }
  );
}
