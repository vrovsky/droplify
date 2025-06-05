"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

//zod custom schema
import { signUpSchema } from "../schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignUpForm() {
  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autherror, setAuthError] = useState<string | null>(null);
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
  };

  const handleVerificationSubmit = async () => {};

  if (verifying) {
    return (
      <div>
        <p>this is OTP entering field</p>
      </div>
    );
  }
  return <h1>this is sign up form with email and other fields</h1>;
}
