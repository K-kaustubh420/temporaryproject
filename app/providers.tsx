"use client";

import { MailProvider } from "./context/MailContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MailProvider>{children}</MailProvider>;
}
