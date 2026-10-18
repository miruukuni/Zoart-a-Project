import { Grandstander, Inter } from "next/font/google";

const grandstander = Grandstander({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-search-inter",
  display: "swap",
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${grandstander.className} ${inter.variable} min-h-dvh bg-[#FFEBC6] text-[#111111]`}>{children}</div>;
}
