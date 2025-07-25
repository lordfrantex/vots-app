import { z } from "zod";

// Utility schemas
const walletAddressSchema = z
  .string()
  .min(1, "Wallet address is required")
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address");

const dateTimeSchema = z
  .string()
  .min(1, "Date and time must be in the future")
  .refine(
    (date) => new Date(date) > new Date(),
    "Date and time must be in the future",
  );

// More flexible regex for general text (allows most printable characters)
const flexibleTextRegex = /^[\w\s\-_'"\(\)\[\]\/\.,&@#\$%\^*+=:;!?]+$/;
const nameRegex = /^[\w\s\-'"\.\(\)]+$/; // For names (slightly more restrictive)

// Basic Info Schema
export const basicInfoSchema = z
  .object({
    name: z
      .string()
      .min(3, "Election name must be at least 3 characters")
      .max(300, "Election name must not exceed 300 characters")
      .regex(flexibleTextRegex, "Election name contains invalid characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(900, "Description must not exceed 900 characters")
      .regex(flexibleTextRegex, "Description contains invalid characters"),
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
      return diffHours;
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
            .max(400, "Category name must not exceed 400 characters")
            .regex(
              flexibleTextRegex,
              "Category name contains invalid characters",
            ),
        }),
      )
      .min(1, "At least one position category is required")
      .max(100, "Maximum 100 categories allowed"),
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

// Candidates Schema (depends on categories) - uses matricNo
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
              .max(100, "Candidate name must not exceed 100 characters")
              .regex(nameRegex, "Candidate name contains invalid characters"),
            matricNo: z
              .string()
              .min(3, "Matric number must be at least 3 characters")
              .max(400, "Matric number must not exceed 400 characters")
              .regex(
                flexibleTextRegex,
                "Matric number contains invalid characters",
              ),
            category: z.enum(validCategories as [string, ...string[]], {
              errorMap: () => ({ message: "Please select a valid category" }),
            }),
            photo: z.string().optional(),
          }),
        )
        .min(1, "At least one candidate is required")
        .max(100, "Maximum 100 candidates allowed"),
    })
    .refine(
      (data) => {
        const matricNos = data.candidates.map((c) =>
          c.matricNo.toLowerCase().trim(),
        );
        const uniqueMatricNos = new Set(matricNos);
        return uniqueMatricNos.size === matricNos.length;
      },
      {
        message:
          "All candidate matric numbers must be unique. Duplicate matric numbers found - please use unique identifiers like matric numbers or student IDs",
        path: ["candidates"],
      },
    )
    .refine(
      (data) => {
        const candidateNames = data.candidates.map((c) =>
          c.name.toLowerCase().trim(),
        );
        const uniqueNames = new Set(candidateNames);
        return uniqueNames.size === candidateNames.length;
      },
      {
        message: "All candidate names must be unique. Duplicate names found",
        path: ["candidates"],
      },
    )
    .refine(
      (data) => {
        // Ensure each category has at least one candidate
        const categoriesWithCandidates = new Set(
          data.candidates.map((c) => c.category),
        );
        const missingCategories = validCategories.filter(
          (cat) => !categoriesWithCandidates.has(cat),
        );
        return missingCategories.length === 0;
      },
      {
        message: "Each position category must have at least one candidate",
        path: ["candidates"],
      },
    )
    .refine(
      (data) => {
        // Check that no category has too many candidates (optional business rule)
        const categoryCount: Record<string, number> = {};
        data.candidates.forEach((candidate) => {
          categoryCount[candidate.category] =
            (categoryCount[candidate.category] || 0) + 1;
        });

        // Allow up to 20 candidates per category
        const maxCandidatesPerCategory = 20;
        const overloadedCategories = Object.entries(categoryCount)
          .filter(([, count]) => count > maxCandidatesPerCategory)
          .map(([category]) => category);

        return overloadedCategories.length === 0;
      },
      {
        message: `Each category can have a maximum of 20 candidates`,
        path: ["candidates"],
      },
    );

// Voters Schema - uses matricNumber (different from candidates)
// Updated to make voters optional for creation but required for batch addition
export const votersSchema = z.object({
  voters: z
    .array(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(2, "Voter name must be at least 2 characters")
          .max(500, "Voter name must not exceed 500 characters")
          .regex(nameRegex, "Voter name contains invalid characters"),
        matricNumber: z
          .string()
          .min(3, "Matric number must be at least 3 characters")
          .max(20, "Matric number must not exceed 20 characters")
          .regex(
            flexibleTextRegex,
            "Matric number contains invalid characters",
          ),
        level: z
          .string()
          .min(1, "Level is required")
          .max(100, "Level must not exceed 100 characters")
          .regex(/^[0-9]+$/, "Level must be a number"),
        department: z
          .string()
          .max(500, "Department name must not exceed 500 characters")
          .regex(
            flexibleTextRegex,
            "Department name contains invalid characters",
          )
          .optional()
          .or(z.literal("")),
      }),
    )
    // Remove the min requirement for election creation
    .max(10000, "Maximum 10,000 voters allowed"),
});

// Add a stricter schema for batch voter addition
export const votersBatchSchema = votersSchema
  .refine((data) => data.voters.length > 0, {
    message: "At least one voter is required",
    path: ["voters"],
  })
  .refine(
    (data) => {
      const matricNumbers = data.voters.map((v) =>
        v.matricNumber.toLowerCase(),
      );
      return new Set(matricNumbers).size === matricNumbers.length;
    },
    {
      message: "Matric numbers must be unique",
      path: ["voters"],
    },
  );

// Polling Setup Schema - KEPT STRICT ETHEREUM VALIDATION
export const pollingSetupSchema = z.object({
  pollingOfficers: z
    .array(
      z.object({
        id: z.string(),
        address: walletAddressSchema, // STRICT: Ethereum address validation
        role: z.string(),
        name: z
          .string()
          .min(2, "Officer name must be at least 2 characters")
          .max(300, "Officer name must not exceed 300 characters")
          .regex(nameRegex, "Officer name contains invalid characters"),
      }),
    )
    .min(1, "At least one polling officer is required")
    .max(200, "Maximum 200 polling officers allowed"),
  pollingUnits: z
    .array(
      z.object({
        id: z.string(),
        address: walletAddressSchema, // STRICT: Ethereum address validation
        name: z
          .string()
          .min(2, "Unit name must be at least 2 characters")
          .max(300, "Unit name must not exceed 300 characters")
          .regex(nameRegex, "Unit name contains invalid characters"),
      }),
    )
    .min(1, "At least one polling unit is required")
    .max(500, "Maximum 500 polling units allowed"),
});

// Updated Complete Election Schema (for final validation)
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
export type VotersFormData = z.infer<typeof votersSchema>;
export type VotersBatchFormData = z.infer<typeof votersBatchSchema>;
export type PollingSetupFormData = z.infer<typeof pollingSetupSchema>;
// Helper function to get duplicate candidate IDs for better error reporting
