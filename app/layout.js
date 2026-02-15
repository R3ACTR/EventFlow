import "./globals.css";
import Providers from "./providers";
import GlobalAnnouncements from "@/components/GlobalAnnouncements";

export const metadata = {
  title: "EventFlow – Modular Hackathon Infra System",
  description: "A modular platform to manage hackathons and open-source programs.",
};

export default function RootLayout({ children }) {
  return (
  <html lang="en">
    <body className="antialiased bg-slate-50 text-slate-900">
      <Providers>
        <GlobalAnnouncements />
        {children}
      </Providers>
    </body>
  </html>
);

}
