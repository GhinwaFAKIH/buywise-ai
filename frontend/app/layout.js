import "./globals.css";
import PwaSupport from "./components/PwaSupport";

export const metadata = {
  title: "BuyWise AI",
  description: "Find out if a product is actually worth buying.",
  appleWebApp: { capable: true, title: "BuyWise AI", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png", icon: "/icons/icon-192.png" },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#7351c4", viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><PwaSupport />{children}</body>
    </html>
  );
}
