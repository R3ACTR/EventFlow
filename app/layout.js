import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "EventFlow – Modular Hackathon Infra System",
  description: "A modular platform to manage hackathons and open-source programs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-space-900 text-slate-200 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
