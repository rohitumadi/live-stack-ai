import { useClerk } from "@clerk/nextjs";

export function UseIt() {
  const clerk = useClerk();

  const h = async () => {
    clerk.client.signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };
}
