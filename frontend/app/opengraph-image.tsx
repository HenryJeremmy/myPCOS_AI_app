import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "myPCOS";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(244,114,182,0.30), transparent 25%), radial-gradient(circle at top right, rgba(168,85,247,0.18), transparent 22%), linear-gradient(180deg, #fffdfd 0%, #fbf6f8 38%, #f6eef4 100%)",
          padding: "64px 72px",
          color: "#2e1830",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              height: 120,
              width: 120,
              borderRadius: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8a3fd8, #cf41ca)",
              color: "white",
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            ♥
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: -2 }}>
              myPCOS
            </div>
            <div style={{ fontSize: 22, color: "#7b667c" }}>
              AI-enabled PCOS self-management support
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 860,
          }}
        >
          <div
            style={{
              fontSize: 66,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: -2.4,
            }}
          >
            Track meals, symptoms, and lifestyle patterns in one structured workspace.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "#6f5a72",
            }}
          >
            AI-assisted meal logging, gentle behavioural insights, and clear non-diagnostic feedback for women with PCOS.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
