"use client";

import type React from "react";
import { useState } from "react";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import type { ClerkError } from "@clerk/shared/error";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AuthDivider } from "@/components/auth-divider";
import { FloatingPaths } from "@/components/floating-paths";
import { ChevronLeftIcon, AtSignIcon } from "lucide-react";

function formatClerkError(error: ClerkError | null): string {
  if (!error) return "";
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    return first?.longMessage ?? first?.message ?? error.message;
  }
  return error.longMessage ?? error.message;
}

function clerkErrorCode(error: ClerkError | null): string | undefined {
  if (!error) return undefined;
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.code;
  }
  return error.code;
}

function formatUnknownError(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    return first?.longMessage ?? first?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export function AuthPage() {
  const clerk = useClerk();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [error, setError] = useState("");

  const isReady =
    clerk.loaded &&
    signInFetchStatus === "idle" &&
    signUpFetchStatus === "idle";

  const handleOAuth = async (strategy: "oauth_google" | "oauth_github") => {
    if (!isReady || !clerk.client) return;
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/editor",
      });
    } catch (err: unknown) {
      setError(formatUnknownError(err));
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !signIn || !signUp) return;
    setError("");

    const { error: createSignInError } = await signIn.create({
      identifier: emailAddress,
    });

    if (createSignInError) {
      const errCode = clerkErrorCode(createSignInError);
      if (errCode === "form_identifier_not_found") {
        const { error: createSignUpError } = await signUp.create({
          emailAddress,
        });
        if (createSignUpError) {
          setError(formatClerkError(createSignUpError));
          return;
        }
        const { error: sendErr } = await signUp.verifications.sendEmailCode();
        if (sendErr) {
          setError(formatClerkError(sendErr));
          return;
        }
        setIsSignIn(false);
        setPendingVerification(true);
        return;
      }
      setError(formatClerkError(createSignInError));
      return;
    }

    const { error: sendErr } = await signIn.emailCode.sendCode({
      emailAddress,
    });
    if (sendErr) {
      setError(formatClerkError(sendErr));
      return;
    }
    setIsSignIn(true);
    setPendingVerification(true);
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !signIn || !signUp) return;
    setError("");

    if (isSignIn) {
      const { error: verifyErr } = await signIn.emailCode.verifyCode({
        code,
      });
      if (verifyErr) {
        setError(formatClerkError(verifyErr));
        return;
      }
      if (signIn.status !== "complete") {
        setError("Sign-in could not be completed.");
        return;
      }
      const { error: finalizeErr } = await signIn.finalize();
      if (finalizeErr) {
        setError(formatClerkError(finalizeErr));
        return;
      }
      window.location.replace("/");
      return;
    }

    const { error: verifyErr } = await signUp.verifications.verifyEmailCode({
      code,
    });
    if (verifyErr) {
      setError(formatClerkError(verifyErr));
      return;
    }
    if (signUp.status !== "complete") {
      setError("Sign-up could not be completed.");
      return;
    }
    const { error: finalizeErr } = await signUp.finalize();
    if (finalizeErr) {
      setError(formatClerkError(finalizeErr));
      return;
    }
    window.location.replace("/");
  };
  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <Logo className="mr-auto h-4.5" />
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;This Platform has helped me to save time and serve my
              clients faster than ever before.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">
              ~ Ali Hassan
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center px-8">
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>

        <Button
          className="absolute top-7 left-5"
          variant="ghost"
          render={<a href="#" />}
          nativeButton={false}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Home
        </Button>

        <div className="mx-auto space-y-4 sm:w-sm">
          <Logo className="h-4.5 lg:hidden" />
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">
              Sign In or Join Now!
            </h1>
            <p className="text-base text-muted-foreground">
              login or create your account.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => handleOAuth("oauth_google")}
              disabled={!isReady}
            >
              <GoogleIcon data-icon="inline-start" />
              Continue with Google
            </Button>
            <Button
              className="w-full"
              onClick={() => handleOAuth("oauth_github")}
              disabled={!isReady}
            >
              <GithubIcon data-icon="inline-start" />
              Continue with GitHub
            </Button>
          </div>

          <AuthDivider>OR</AuthDivider>

          {pendingVerification ? (
            <form className="space-y-2" onSubmit={handleVerification}>
              <p className="text-start text-muted-foreground text-xs">
                Enter the 6-digit code sent to your email
              </p>
              <InputGroup>
                <InputGroupInput
                  placeholder="Code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </InputGroup>
              {error && <p className="text-destructive text-xs">{error}</p>}
              <Button className="w-full" type="submit">
                Verify Email
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                type="button"
                onClick={() => {
                  setPendingVerification(false);
                  setCode("");
                  setError("");
                }}
              >
                Back
              </Button>
            </form>
          ) : (
            <form className="space-y-2" onSubmit={handleEmailSubmit}>
              <p className="text-start text-muted-foreground text-xs">
                Enter your email address to sign in or create an account
              </p>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <AtSignIcon />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="your.email@example.com"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
              </InputGroup>
              {error && <p className="text-destructive text-xs">{error}</p>}
              <Button className="w-full" type="submit" disabled={!isReady}>
                Continue With Email
              </Button>
            </form>
          )}

          <p className="mt-8 text-muted-foreground text-sm">
            By clicking continue, you agree to our{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="#"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .268.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}
