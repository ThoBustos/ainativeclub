import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0a0908",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8a849",
          fontFamily: "monospace",
          fontWeight: 700,
          borderRadius: 6,
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
