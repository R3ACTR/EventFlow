import "./globals.css";
import Providers from "./providers";
import GlobalAnnouncements from "@/components/GlobalAnnouncements";


export const metadata = {
  title: "EventFlow – Modular Hackathon Infra System",
  description: "A modular platform to manage hackathons and open-source programs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-space-900 text-slate-200 font-sans"
        suppressHydrationWarning
      >
        <Providers>
          <GlobalAnnouncements />
          {children}
        </Providers>
      </body>
    </html>
  );
}
