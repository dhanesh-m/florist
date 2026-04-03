import { ImageResponse } from "next/og";

/** PNG favicon — broad browser support (some ignore `icon.svg` in `app/`). */
export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f7",
          color: "#2a2521",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
          borderRadius: 8,
        }}
      >
        F
      </div>
    ),
    { ...size }
  );
}
