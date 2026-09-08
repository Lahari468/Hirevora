import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { useRecruiterProfile } from "../../hooks/useRecruiterProfile.js";
import { recruiterService } from "../../services/recruiterService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse } from "../../types/index.js";

const profileSchema = z.object({
  jobTitle: z.string().max(100).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function RecruiterProfilePage(): JSX.Element {
  const { data: profile, isLoading, error, refetch } = useRecruiterProfile();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile) {
      reset({ jobTitle: profile.jobTitle ?? "" });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    setServerError(null);
    try {
      const res = await recruiterService.updateProfile({ jobTitle: values.jobTitle || undefined });
      if (res.success) {
        showToast("Profile updated", "success");
        refetch();
      } else {
        setServerError(res.message);
      }
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to update profile.");
    }
  };

  if (isLoading) {
    return (
      <AppShell title="My Profile">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell title="My Profile">
        <ErrorState description={error ?? "Unable to load your profile."} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell title="My Profile">
      <PageHeader title="My Profile" description="Your recruiter account information." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <p role="alert" className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {serverError}
          </p>
        )}

        <Card>
          <CardHeader title="Personal information" />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" value={profile.user.name} disabled />
            <Input label="Email" value={profile.user.email} disabled />
            <Input
              label="Job title"
              placeholder="e.g. Talent Acquisition Manager"
              hint="Optional"
              error={errors.jobTitle?.message}
              {...register("jobTitle")}
            />
            {profile.company && <Input label="Company" value={profile.company.name} disabled />}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
