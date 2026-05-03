import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/editor"
      signUpFallbackRedirectUrl="/editor"
    />
  );
}
