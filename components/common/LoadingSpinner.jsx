
export default function LoadingSpinner({ size = 18 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(255,255,255,0.3)",
        borderTop: "2px solid #ffffff",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }}
    />
  );
}
