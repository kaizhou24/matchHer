// src/pages/auth/login.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router"; // For Pages Router
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button"; // Assuming shadcn/ui setup
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react"; // Icon

import { supabase } from "@/lib/supabaseClient"; // Your Supabase client

// 1. Define the form schema with Zod
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, { // Supabase default password policy is often 6, adjust if needed
    message: "Password must be at least 8 characters.",
  }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null); // For Supabase auth errors
  const router = useRouter();

  // 2. Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Handle form submission with Supabase
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null); // Clear previous errors

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setIsLoading(false);

    if (error) {
      console.error("Supabase login error:", error.message);
      setAuthError(error.message); // Display Supabase error to the user
    } else if (data.user) {
      console.log("Login successful, user:", data.user);
      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } else {
      // Fallback error if no user and no specific error from Supabase
      setAuthError("An unexpected issue occurred during login. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2"> {/* Make logo a link to home */}
            <Users className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">MentorMatch</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/signup"> {/* Assuming signup page is at /auth/signup */}
              <Button variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12"> {/* Centering the card */}
        <div className="container max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center"> {/* Centering header text */}
              <CardTitle className="text-2xl font-bold">Log In</CardTitle>
              <CardDescription>
                Enter your email and password to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email" // Explicitly set type for better browser handling
                            placeholder="name@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage /> {/* Displays Zod validation errors */}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage /> {/* Displays Zod validation errors */}
                      </FormItem>
                    )}
                  />
                  {authError && ( // Display Supabase authentication errors
                    <p className="text-sm font-medium text-destructive">
                      {authError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <Link href="#" className="text-pink-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center"> {/* Centering footer content */}
              <div className="text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-pink-500 hover:underline"> {/* Assuming signup page */}
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}