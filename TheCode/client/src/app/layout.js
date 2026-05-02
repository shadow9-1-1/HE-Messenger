export const metadata = {
  title: "Hybrid Ephemeral Messenger",
  description: "Next.js frontend for the Hybrid Ephemeral Messenger"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
