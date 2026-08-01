import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon. The site shipped without one. */
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
          fontSize: 18,
          fontWeight: 800,
          color: "#0B1F3A",
          background: "linear-gradient(135deg, #E4C558, #D4AF37 55%, #B8962E)",
          borderRadius: 7,
        }}
      >
        AK
      </div>
    ),
    size
  );
}
