import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/context/SidebarContext";
import Navbar from "@/components/nav-bar/NavBar";
import Sidebar from "@/components/nav-bar/sidebar/Sidebar";

export const metadata = {
  title: "Favorite City App",
  description: "Discover Your Next Favorite City with Us!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <Sidebar />
            <div>
              <Navbar />
              <main className="m-auto px-4 sm:px-8 ">{children}</main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
