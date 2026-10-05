import "./globals.css";

export const metadata = {
  title: "BuyWise AI",
  description: "Find out if a product is actually worth buying.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
