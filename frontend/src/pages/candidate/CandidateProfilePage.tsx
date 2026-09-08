import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Input } from "../../components/ui/Input.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { useCandidateProfile } from "../../hooks/useCandidateProfile.js";
import { candidateService } from "../../services/candidateService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse } from "../../types/index.js";

const profileSchema = z.object({
  headline: z.string().max(100).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s\-+()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).max(70).optional(),
  education: z.string().max(500).optional().or(z.literal("")),
  linkedinUrl: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function CandidateProfilePage(): JSX.Element {
  const { data: profile, isLoading, error, refetch } = useCandidateProfile();
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
      reset({
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        experienceYears: profile.experienceYears ?? undefined,
        education: profile.education ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    setServerError(null);
    try {
      const res = await candidateService.updateProfile({
        headline: values.headline || undefined,
        bio: values.bio || undefined,
        phone: values.phone || undefined,
        location: values.location || undefined,
        experienceYears: values.experienceYears,
        education: values.education || undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        githubUrl: values.githubUrl || undefined,
      });
      if (res.success) {
        showToast("Profile updated", "success");
        refetch();
      } else {
        setServerError(res.message);
      }
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to update your profile.");
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
      <PageHeader title="My Profile" description="Keep your information up to date for recruiters." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {serverError && (
          <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {serverError}
          </p>
        )}

        <Card>
          <CardHeader title="Personal information" />
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Name" value={profile.user.name} disabled />
            <Input label="Email" value={profile.user.email} disabled />
            <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
            <Input label="Location" error={errors.location?.message} {...register("location")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Professional information" />
          <CardContent className="grid grid-cols-1 gap-4">
            <Input
              label="Headline"
              placeholder="e.g. Frontend Engineer"
              error={errors.headline?.message}
              {...register("headline")}
            />
            <Textarea
              label="Bio"
              placeholder="Tell recruiters about yourself"
              rows={4}
              error={errors.bio?.message}
              {...register("bio")}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Years of experience"
                type="number"
                min={0}
                max={70}
                error={errors.experienceYears?.message}
                {...register("experienceYears")}
              />
              <Input label="Education" error={errors.education?.message} {...register("education")} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/..."
                error={errors.linkedinUrl?.message}
                {...register("linkedinUrl")}
              />
              <Input
                label="GitHub URL"
                placeholder="https://github.com/..."
                error={errors.githubUrl?.message}
                {...register("githubUrl")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
