import { AuthPage } from "@/components/auth-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Live Stack AI",
  description: "Sign in to your Live Stack AI account.",
};

export default function SignInPage() {
  return <AuthPage />;
}
