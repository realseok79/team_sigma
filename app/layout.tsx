import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { TaskProvider } from "@/context/TaskContext";
import { NotificationManager } from "@/components/NotificationManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team-Sigma",
  description: "Advanced productivity timer and to-do list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased flex min-h-screen`}>
        <TaskProvider>
          <NotificationManager />
          <Sidebar />
          <div className="flex-1 flex flex-col bg-background transition-colors duration-300">
            <TopBar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </TaskProvider>
      </body>
    </html>
  );
}
