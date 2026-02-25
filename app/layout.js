import "./globals.css";
import Providers from "./providers";
import GlobalAnnouncements from "@/components/GlobalAnnouncements";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import CommandPalette from "@/components/common/CommandPalette";

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
          <Breadcrumbs />
          <CommandPalette />
          {children}
        </Providers>
      </body>
    </html>
  );
}
