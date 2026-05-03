import { AuthPage } from "@/components/auth-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — Live Stack AI",
  description: "Create your Live Stack AI account.",
};

export default function SignUpPage() {
  return <AuthPage />;
}
