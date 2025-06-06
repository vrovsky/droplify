"use client";

import { useSignUp } from "@clerk/nextjs";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

//zod custom schema
import { signUpSchema } from "../schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { set } from "zod/v4";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autherror, setAuthError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [verificationCode, setVerificationCode] = useState("");
  const { signUp, isLoaded, setActive } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setVerifying(true);
    } catch (error: any) {
      console.error("Error signing up: ", error);
      setAuthError(
        error.errors?.[0]?.message || "Failed to sign up. Please, try again"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      console.log(result + " AAAAAAAA");
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log("Verification incomplete: ", result);
        setVerificationError("Verification incomplete.");
      }
    } catch (error: any) {
      console.error("Error signing up: ", error);
      setVerificationError(
        error.errors?.[0]?.message || "Failed to sign up. Please, try again"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div>
        <p>this is OTP entering field</p>
      </div>
    );
  }
  return <h1>this is sign up form with email and other fields</h1>;
}
