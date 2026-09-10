import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { useAuth } from "../../context/AuthContext.js";
import { ROLE_HOME_PATH } from "../../navigation/navConfig.js";
import type { ApiResponse } from "../../types/index.js";
import HireVoraLogo from "../../components/brand/HireLynkLogo.js";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number");

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    role: z.enum(["CANDIDATE", "RECRUITER"]),
    companyName: z.string().optional(),
    companyWebsite: z.string().optional(),
    companyLocation: z.string().optional(),
  })
  .refine((data) => data.role !== "RECRUITER" || Boolean(data.companyName && data.companyName.length >= 2), {
    message: "Company name is required",
    path: ["companyName"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function Register(): JSX.Element {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CANDIDATE" },
  });

  const role = watch("role");

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    setServerError(null);
    try {
      const user =
        values.role === "RECRUITER"
          ? await registerUser({
              name: values.name,
              email: values.email,
              password: values.password,
              role: "RECRUITER",
              company: {
                name: values.companyName ?? "",
                website: values.companyWebsite || undefined,
                location: values.companyLocation || undefined,
              },
            })
          : await registerUser({
              name: values.name,
              email: values.email,
              password: values.password,
              role: "CANDIDATE",
            });
      navigate(ROLE_HOME_PATH[user.role], { replace: true });
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to create your account. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <HireVoraLogo variant="mark" />
          <span className="text-lg font-semibold text-navy-900">HireVora</span>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-card p-6 shadow-card">
          <h1 className="text-xl font-semibold text-navy-900">Create an account</h1>
          <p className="mt-1 text-sm text-navy-500">Get started with HireVora in a minute.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            {serverError && (
              <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
                {serverError}
              </p>
            )}

            <Select
              label="I am a"
              options={[
                { value: "CANDIDATE", label: "Candidate — looking for jobs" },
                { value: "RECRUITER", label: "Recruiter — hiring talent" },
              ]}
              {...register("role")}
            />

            <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />

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
              autoComplete="new-password"
              hint={!errors.password ? "At least 8 characters, with a number and both cases" : undefined}
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

            {role === "RECRUITER" && (
              <div className="flex flex-col gap-4 rounded-md border border-surface-border bg-surface-muted p-3">
                <Input
                  label="Company name"
                  error={errors.companyName?.message}
                  {...register("companyName")}
                />
                <Input label="Company website (optional)" {...register("companyWebsite")} />
                <Input label="Company location (optional)" {...register("companyLocation")} />
              </div>
            )}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-navy-500">
          Already have an account?{" "}
          <Link to="/login" className="focus-ring rounded font-medium text-accent-600 hover:text-accent-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
