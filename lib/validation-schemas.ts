import { z } from "zod";

// Utility schemas
const walletAddressSchema = z
  .string()
  .min(1, "Wallet address is required")
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address");

const dateTimeSchema = z
  .string()
  .min(1, "Date and time must be greater than current time")
  .refine(
    (date) => new Date(date) > new Date(),
    "Date and time must be in the future",
  );

// Basic Info Schema
export const basicInfoSchema = z
  .object({
    name: z
      .string()
      .min(3, "Election name must be at least 3 characters")
      .max(50, "Election name must not exceed 50 characters")
      .regex(/^[a-zA-Z0-9\s-_]+$/, "Election name contains invalid characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(100, "Description must not exceed 100 characters"),
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
    timezone: z.string().min(1, "Timezone is required"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return diffHours >= 1; // Minimum 1 hour election
    },
    {
      message: "Election must run for at least 1 hour",
      path: ["endDate"],
    },
  );

// Categories Schema
export const categoriesSchema = z
  .object({
    categories: z
      .array(
        z.object({
          id: z.string(),
          name: z
            .string()
            .min(2, "Category name must be at least 2 characters")
            .max(30, "Category name must not exceed 30 characters")
            .regex(
              /^[a-zA-Z\s]+$/,
              "Category name can only contain letters and spaces",
            ),
        }),
      )
      .min(1, "At least one position category is required")
      .max(10, "Maximum 10 categories allowed"),
  })
  .refine(
    (data) => {
      const names = data.categories.map((cat) => cat.name.toLowerCase().trim());
      return new Set(names).size === names.length;
    },
    {
      message: "Category names must be unique",
      path: ["categories"],
    },
  );

// Candidates Schema (depends on categories)
export const createCandidatesSchema = (validCategories: string[]) =>
  z
    .object({
      candidates: z
        .array(
          z.object({
            id: z.string(),
            name: z
              .string()
              .min(2, "Candidate name must be at least 2 characters")
              .max(50, "Candidate name must not exceed 50 characters")
              .regex(
                /^[a-zA-Z\s.-]+$/,
                "Candidate name contains invalid characters",
              ),
            candidateId: z
              .string()
              .min(3, "Candidate ID must be at least 3 characters")
              .max(20, "Candidate ID must not exceed 20 characters")
              .regex(
                /^[a-zA-Z0-9/-_]+$/,
                "Candidate ID can only contain letters, numbers, hyphens,backlash and underscores",
              ),
            category: z.enum(validCategories as [string, ...string[]], {
              errorMap: () => ({ message: "Please select a valid category" }),
            }),
            photo: z.string().optional(),
          }),
        )
        .min(1, "At least one candidate is required"),
    })
    .refine(
      (data) => {
        const candidateIds = data.candidates.map((c) =>
          c.candidateId.toLowerCase(),
        );
        return new Set(candidateIds).size === candidateIds.length;
      },
      {
        message: "Candidate IDs must be unique",
        path: ["candidates"],
      },
    )
    .refine(
      (data) => {
        // Ensure each category has at least one candidate
        const categoriesWithCandidates = new Set(
          data.candidates.map((c) => c.category),
        );
        return validCategories.every((cat) =>
          categoriesWithCandidates.has(cat),
        );
      },
      {
        message: "Each category must have at least one candidate",
        path: ["candidates"],
      },
    );

// Polling Setup Schema
export const pollingSetupSchema = z.object({
  pollingOfficers: z
    .array(
      z.object({
        id: z.string(),
        address: walletAddressSchema,
        role: z.string(),
      }),
    )
    .min(1, "At least one polling officer is required")
    .max(20, "Maximum 20 polling officers allowed"),
  pollingUnits: z
    .array(
      z.object({
        id: z.string(),
        address: walletAddressSchema,
        name: z
          .string()
          .min(2, "Unit name must be at least 2 characters")
          .max(30, "Unit name must not exceed 30 characters"),
      }),
    )
    .min(1, "At least one polling unit is required")
    .max(50, "Maximum 50 polling units allowed"),
});

// Complete Election Schema (for final validation)
export const createCompleteElectionSchema = (validCategories: string[]) =>
  z.object({
    basicInfo: basicInfoSchema,
    categories: categoriesSchema,
    candidates: createCandidatesSchema(validCategories),
    polling: pollingSetupSchema,
  });

// Types
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type CategoriesFormData = z.infer<typeof categoriesSchema>;
export type CandidatesFormData = z.infer<
  ReturnType<typeof createCandidatesSchema>
>;
export type PollingSetupFormData = z.infer<typeof pollingSetupSchema>;
export type CompleteElectionData = z.infer<
  ReturnType<typeof createCompleteElectionSchema>
>;
