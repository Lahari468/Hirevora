import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/Input.js";
import { Select } from "../ui/Select.js";
import { Textarea } from "../ui/Textarea.js";
import { Button } from "../ui/Button.js";
import type { CreateJobPayload, EmploymentType } from "../../types/index.js";

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
];

/** Mirrors the backend's createJobSchema/updateJobSchema exactly (backend/src/validators/jobValidator.ts). */
const jobFormSchema = z.object({
  title: z.string().min(5, "At least 5 characters").max(100),
  description: z.string().min(20, "At least 20 characters").max(5000),
  location: z.string().min(2, "At least 2 characters").max(100),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"]),
  experienceRequired: z.union([z.coerce.number().int().min(0).max(50), z.nan()]).optional(),
  salaryMin: z.union([z.coerce.number().positive(), z.nan()]).optional(),
  salaryMax: z.union([z.coerce.number().positive(), z.nan()]).optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

export interface JobFormProps {
  defaultValues?: Partial<JobFormValues>;
  onSubmit: (values: CreateJobPayload) => Promise<void> | void;
  isSubmitting: boolean;
  submitLabel: string;
  serverError?: string | null;
}

export function JobForm({ defaultValues, onSubmit, isSubmitting, submitLabel, serverError }: JobFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  const submit = handleSubmit((values) => {
    const payload: CreateJobPayload = {
      title: values.title,
      description: values.description,
      location: values.location,
      employmentType: values.employmentType as EmploymentType,
      experienceRequired: Number.isNaN(values.experienceRequired) ? undefined : values.experienceRequired,
      salaryMin: Number.isNaN(values.salaryMin) ? undefined : values.salaryMin,
      salaryMax: Number.isNaN(values.salaryMax) ? undefined : values.salaryMax,
    };
    return onSubmit(payload);
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {serverError && (
        <p role="alert" className="rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700">
          {serverError}
        </p>
      )}

      <Input
        label="Job title"
        placeholder="e.g. Senior Frontend Engineer"
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Description"
        placeholder="Describe the role, responsibilities, and what a great candidate looks like"
        rows={8}
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Location" placeholder="e.g. Remote, Bangalore" error={errors.location?.message} {...register("location")} />
        <Select
          label="Employment type"
          options={EMPLOYMENT_TYPE_OPTIONS}
          error={errors.employmentType?.message}
          {...register("employmentType")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Experience required (years)"
          type="number"
          min={0}
          max={50}
          hint="Optional"
          error={errors.experienceRequired?.message}
          {...register("experienceRequired")}
        />
        <Input
          label="Minimum salary"
          type="number"
          min={0}
          hint="Optional"
          error={errors.salaryMin?.message}
          {...register("salaryMin")}
        />
        <Input
          label="Maximum salary"
          type="number"
          min={0}
          hint="Optional"
          error={errors.salaryMax?.message}
          {...register("salaryMax")}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
