"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  basicInfoSchema,
  categoriesSchema,
  createCandidatesSchema,
  pollingSetupSchema,
  createCompleteElectionSchema,
  type BasicInfoFormData,
  type CategoriesFormData,
  type CandidatesFormData,
  type PollingSetupFormData,
  votersSchema,
  VotersFormData,
} from "@/lib/validation-schemas";

export interface ValidationState {
  basicInfo: boolean;
  categories: boolean;
  candidates: boolean;
  voters: boolean;
  polling: boolean;
  complete: boolean;
}

// Define the expected category type (should match your Zod schema)
interface Category {
  name?: string;
  // Add other properties from your schema if needed
}

// Type guard to ensure category has a valid name
const isValidCategory = (
  cat: Category | undefined | null,
): cat is Category & { name: string } => {
  return (
    cat !== null &&
    cat !== undefined &&
    typeof cat.name === "string" &&
    cat.name.trim().length > 0
  );
};

export function useElectionValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    basicInfo: false,
    categories: false,
    candidates: false,
    voters: false,
    polling: false,
    complete: false,
  });

  const [validCategories, setValidCategories] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const previousCategoriesRef = useRef<string>("");

  // Basic Info Form
  const basicInfoForm = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      timezone: "",
    },
  });

  // Categories Form
  const categoriesForm = useForm<CategoriesFormData>({
    resolver: zodResolver(categoriesSchema),
    mode: "onChange",
    defaultValues: {
      categories: [],
    },
  });

  // Candidates Form (dynamic schema based on categories)
  const candidatesSchema = useMemo(() => {
    return validCategories.length > 0
      ? createCandidatesSchema(validCategories)
      : createCandidatesSchema(["placeholder"]);
  }, [validCategories]);

  const candidatesForm = useForm<CandidatesFormData>({
    resolver: zodResolver(candidatesSchema),
    mode: "onChange",
    defaultValues: {
      candidates: [],
    },
  });

  // Voters Form
  const votersForm = useForm<VotersFormData>({
    resolver: zodResolver(votersSchema),
    mode: "onChange",
    defaultValues: {
      voters: [],
    },
  });

  // Polling Setup Form
  const pollingForm = useForm<PollingSetupFormData>({
    resolver: zodResolver(pollingSetupSchema),
    mode: "onChange",
    defaultValues: {
      pollingOfficers: [],
      pollingUnits: [],
    },
  });

  // Update validation state and current step based on form validity
  useEffect(() => {
    const basicInfoValid = basicInfoForm.formState.isValid;
    const categoriesValid =
      categoriesForm.formState.isValid && validCategories.length > 0;
    const candidatesValid =
      candidatesForm.formState.isValid &&
      candidatesForm.getValues("candidates").length > 0;
    const votersValid =
      votersForm.formState.isValid && votersForm.getValues("voters").length > 0;

    const pollingValid =
      pollingForm.formState.isValid &&
      pollingForm.getValues("pollingOfficers").length > 0 &&
      pollingForm.getValues("pollingUnits").length > 0;

    const newValidationState = {
      basicInfo: basicInfoValid,
      categories: categoriesValid && basicInfoValid,
      candidates: candidatesValid && categoriesValid && basicInfoValid,
      voters:
        votersValid && candidatesValid && categoriesValid && basicInfoValid,
      polling:
        pollingValid && candidatesValid && categoriesValid && basicInfoValid,
      complete:
        basicInfoValid && categoriesValid && candidatesValid && pollingValid,
    };

    setValidationState(newValidationState);

    // Auto-advance current step based on completion
    let newCurrentStep = 0;
    if (newValidationState.complete) newCurrentStep = 4;
    else if (newValidationState.polling) newCurrentStep = 4;
    else if (newValidationState.candidates) newCurrentStep = 3;
    else if (newValidationState.categories) newCurrentStep = 2;
    else if (newValidationState.basicInfo) newCurrentStep = 1;

    setCurrentStep(newCurrentStep);
  }, [
    basicInfoForm.formState.isValid,
    categoriesForm.formState.isValid,
    candidatesForm.formState.isValid,
    votersForm.formState.isValid,
    pollingForm.formState.isValid,
    validCategories.length,
  ]);

  // Update valid categories when categories form changes
  useEffect(() => {
    const subscription = categoriesForm.watch((value) => {
      const categories = value.categories || [];

      // Use type guard to filter and map safely
      const validCategoryNames = categories
        .filter(isValidCategory) // TypeScript now knows these have valid names
        .map((cat) => cat.name.trim()); // No TypeScript error

      const categoriesString = JSON.stringify(validCategoryNames.sort());

      if (categoriesString !== previousCategoriesRef.current) {
        previousCategoriesRef.current = categoriesString;
        setValidCategories(validCategoryNames);

        // Reset candidates form when categories change significantly
        const currentCandidates = candidatesForm.getValues("candidates");
        const validCandidates = currentCandidates.filter((candidate) =>
          validCategoryNames.includes(candidate.category),
        );

        if (
          validCandidates.length !== currentCandidates.length ||
          validCategoryNames.length === 0
        ) {
          candidatesForm.setValue("candidates", validCandidates, {
            shouldValidate: true,
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [categoriesForm, candidatesForm]);

  // Validate complete election
  const validateCompleteElection = useCallback(() => {
    if (validCategories.length === 0) {
      return {
        success: false,
        data: null,
        errors: ["No valid categories found"],
      };
    }

    const completeSchema = createCompleteElectionSchema(validCategories);

    const data = {
      basicInfo: basicInfoForm.getValues(),
      categories: categoriesForm.getValues(),
      candidates: candidatesForm.getValues(),
      voters: votersForm.getValues(),
      polling: pollingForm.getValues(),
    };

    try {
      completeSchema.parse(data);
      return { success: true, data, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }, [
    basicInfoForm,
    categoriesForm,
    candidatesForm,
    votersForm,
    pollingForm,
    validCategories,
  ]);

  // Check if section can be accessed
  const canAccessSection = useCallback(
    (section: keyof ValidationState) => {
      switch (section) {
        case "basicInfo":
          return true;
        case "categories":
          return validationState.basicInfo;
        case "candidates":
          return validationState.categories && validCategories.length > 0;
        case "voters":
          return validationState.candidates;
        case "polling":
          return validationState.voters;
        case "complete":
          return validationState.polling;
        default:
          return false;
      }
    },
    [validationState, validCategories],
  );

  return {
    forms: {
      basicInfo: basicInfoForm,
      categories: categoriesForm,
      candidates: candidatesForm,
      voters: votersForm,
      polling: pollingForm,
    },
    validationState,
    validCategories,
    currentStep,
    setCurrentStep,
    validateCompleteElection,
    canAccessSection,
  };
}
