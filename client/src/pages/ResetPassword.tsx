import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, Loader2, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must include lowercase, uppercase, and number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setTokenError(true);
    }
  }, []);

  const handleSubmit = async (data: ResetPasswordData) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        password: data.password,
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password Reset",
          description: "Your password has been reset successfully.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Reset Failed",
          description: error.error || "Invalid or expired reset token",
          variant: "destructive",
        });
        setTokenError(true);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset password", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <CardTitle className="font-mono text-xl">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full font-mono"
              onClick={() => setLocation("/")}
              data-testid="button-go-home"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle className="font-mono text-xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full font-mono"
              onClick={() => setLocation("/")}
              data-testid="button-go-home-error"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-mono text-xl">Reset Your Password</CardTitle>
          <CardDescription>Enter a new password for your Normie Nation account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-sm">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-9 font-mono"
                  placeholder="Enter new password"
                  {...form.register("password")}
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 font-mono"
                  placeholder="Confirm new password"
                  {...form.register("confirmPassword")}
                  data-testid="input-confirm-password"
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground font-mono">Password requirements:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>At least 8 characters</li>
                <li>One lowercase letter</li>
                <li>One uppercase letter</li>
                <li>One number</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full font-mono"
              disabled={isLoading}
              data-testid="button-reset-password"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
