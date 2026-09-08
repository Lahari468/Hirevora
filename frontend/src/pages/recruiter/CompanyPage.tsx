import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2 } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.js";
import { Input } from "../../components/ui/Input.js";
import { Textarea } from "../../components/ui/Textarea.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { useCompany } from "../../hooks/useCompany.js";
import { companyService } from "../../services/companyService.js";
import { useToast } from "../../context/ToastContext.js";
import type { ApiResponse } from "../../types/index.js";

const companySchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === "object" && value !== null && "message" in value;
}

export function CompanyPage(): JSX.Element {
  const { data: company, isLoading, error, refetch } = useCompany();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companySchema) });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        description: company.description ?? "",
        website: company.website ?? "",
        logoUrl: company.logoUrl ?? "",
        location: company.location ?? "",
      });
    }
  }, [company, reset]);

  const onSubmit = async (values: CompanyFormValues): Promise<void> => {
    setServerError(null);
    const payload = {
      name: values.name,
      description: values.description || undefined,
      website: values.website || undefined,
      logoUrl: values.logoUrl || undefined,
      location: values.location || undefined,
    };
    try {
      const res = company
        ? await companyService.update(payload)
        : await companyService.create(payload);
      if (res.success) {
        showToast(company ? "Company updated" : "Company created", "success");
        refetch();
      } else {
        setServerError(res.message);
      }
    } catch (err) {
      setServerError(isApiResponse(err) ? err.message : "Unable to save company.");
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Company">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppShell>
    );
  }

  // A recruiter with no company yet gets the same form in "create" mode
  const showCreatePrompt = Boolean(error) && !company && !isCreating;

  if (showCreatePrompt) {
    return (
      <AppShell title="Company">
        <PageHeader title="Company" description="Set up your company profile before creating jobs." />
        <Card>
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="No company yet"
            description="Create your company profile to start posting jobs."
            action={<Button size="sm" onClick={() => setIsCreating(true)}>Create company</Button>}
          />
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Company">
      <PageHeader title="Company" description="Manage your company's public information." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <p role="alert" className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {serverError}
          </p>
        )}

        <Card>
          <CardHeader title="Company information" />
          <CardContent className="grid grid-cols-1 gap-4">
            <Input label="Company name" error={errors.name?.message} {...register("name")} />
            <Textarea
              label="Description"
              rows={4}
              hint="Optional"
              error={errors.description?.message}
              {...register("description")}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Website"
                placeholder="https://..."
                hint="Optional"
                error={errors.website?.message}
                {...register("website")}
              />
              <Input label="Location" hint="Optional" error={errors.location?.message} {...register("location")} />
            </div>
            <Input
              label="Logo URL"
              placeholder="https://..."
              hint="Optional"
              error={errors.logoUrl?.message}
              {...register("logoUrl")}
            />
            {company && (company.jobCount !== undefined || company.recruiterCount !== undefined) && (
              <div className="flex gap-6 border-t border-surface-border pt-4 text-sm text-navy-500">
                {company.jobCount !== undefined && <span>{company.jobCount} jobs posted</span>}
                {company.recruiterCount !== undefined && <span>{company.recruiterCount} recruiters</span>}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={company ? !isDirty : false}>
            {company ? "Save changes" : "Create company"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
