"use client"; // This makes this component a Client Component

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomForm from "@/components/form/customForm";
import { Button } from "@/components/ui/button";
import { FaGithubAlt } from "react-icons/fa";

export default function HandleLogin() {
  const [error, setError] = useState(null);
  const [callbackUrl, setCallbackUrl] = useState("/");
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCallback = urlParams.get("callbackUrl");
    if (urlCallback) {
      setCallbackUrl(urlCallback);
    }
  }, []);

  const handleLogin = async (formData) => {
    const { username, password } = formData;

    // Call the signIn function with the credentials
    const result = await signIn("credentials", {
      redirect: false,
      username, // Send the username to credentials provider
      password, // Send the password to credentials provider
    });

    if (result?.error) {
      setError(result.error);
    } else {
      // Redirect to the callbackUrl or default to the homepage
      router.push(callbackUrl);
    }
  };

  const handleGitHubLogin = () => {
    signIn("github", { callbackUrl }).then((result) => {
      if (result?.error) {
        setError("GitHub login failed: " + result.error);
      } else {
        // Successful login, redirect to callbackUrl or home
        router.push(callbackUrl || "/");
      }
    });
  };

  return (
    <CustomForm
      onSubmit={handleLogin}
      error={error}
      placeholders={["Username", "Password"]}
      inputTypes={["text", "password"]}
      fieldNames={["username", "password"]}
      redirectUrl="/signup"
      title="Login"
      redirectText="Don’t have an account?"
      buttonText="Login"
      linkText="Sign up"
    >
      <div className="flex flex-col justify-center items-center">
        <span className="text-center text-sm mt-6 mb-4 opacity-60">
          Or Login with
        </span>
        <Button
          onClick={handleGitHubLogin}
          className="bg-zinc-800 text-white w-full py-2 rounded-2xl hover:bg-zinc-600"
        >
          <FaGithubAlt /> Login with GitHub
        </Button>
      </div>
    </CustomForm>
  );
}
