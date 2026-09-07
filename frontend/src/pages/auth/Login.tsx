import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap } from "lucide-react";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { useAuth } from "../../context/AuthContext.js";
import { ROLE_HOME_PATH } from "../../navigation/navConfig.js";
import type { ApiResponse } from "../../types/index.js";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function Login(): JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setServerError(null);
    try {
      const user = await login({ email: values.email, password: values.password });
      const from = (location.state as { from?: Location } | null)?.from?.pathname;
      navigate(from ?? ROLE_HOME_PATH[user.role], { replace: true });
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900">
            <Zap className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold text-navy-900">HireLynk</span>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-card p-6 shadow-card">
          <h1 className="text-xl font-semibold text-navy-900">Sign in</h1>
          <p className="mt-1 text-sm text-navy-500">Welcome back. Enter your details below.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            {serverError && (
              <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
                {serverError}
              </p>
            )}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              error={errors.password?.message}
              trailingAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="focus-ring rounded text-navy-400 hover:text-navy-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />

            <label className="flex items-center gap-2 text-sm text-navy-600">
              <input
                type="checkbox"
                className="focus-ring h-4 w-4 rounded border-surface-border text-accent-600"
                {...register("rememberMe")}
              />
              Remember me
            </label>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-navy-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="focus-ring rounded font-medium text-accent-600 hover:text-accent-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
