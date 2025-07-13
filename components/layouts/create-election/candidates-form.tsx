"use client";

import {
  ChevronDown,
  ChevronRight,
  Users,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { CandidatesFormData } from "@/lib/validation-schemas";
import { FormSectionWrapper } from "@/components/layouts/create-election/form-section-wrapper";

interface CandidatesFormProps {
  form: UseFormReturn<CandidatesFormData>;
  validCategories: string[];
  isExpanded: boolean;
  onToggle: () => void;
  canAccess: boolean;
  isValid: boolean;
}

export function CandidatesForm({
  form,
  validCategories,
  isExpanded,
  onToggle,
  canAccess,
  isValid,
}: CandidatesFormProps) {
  const {
    control,
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "candidates",
  });

  const addCandidate = () => {
    append({
      id: Date.now().toString(),
      name: "",
      matricNo: "",
      category: validCategories[0] || "",
    });
  };

  // Helper function to get all error messages including root-level errors
  const getAllErrorMessages = (): string[] => {
    const messages: string[] = [];

    // Get field-level errors
    if (errors.candidates) {
      // Handle array-level errors (like unique validation)
      if (errors.candidates.message) {
        messages.push(errors.candidates.message);
      }

      // Handle root-level errors (cross-field validation)
      if (errors.candidates.root?.message) {
        messages.push(errors.candidates.root.message);
      }

      // Handle individual field errors
      if (Array.isArray(errors.candidates)) {
        errors.candidates.forEach((candidate, index) => {
          if (candidate?.name?.message) {
            messages.push(`Candidate ${index + 1}: ${candidate.name.message}`);
          }
          if (candidate?.matricNo?.message) {
            messages.push(
              `Candidate ${index + 1}: ${candidate.matricNo.message}`,
            );
          }
          if (candidate?.category?.message) {
            messages.push(
              `Candidate ${index + 1}: ${candidate.category.message}`,
            );
          }
        });
      }
    }

    // Check for root-level form errors
    if (form.formState.errors.root?.message) {
      messages.push(form.formState.errors.root.message);
    }

    return messages.filter(Boolean);
  };

  const errorMessages = getAllErrorMessages();

  // Watch all candidate IDs to show real-time duplicate detection
  const watchedCandidates = watch("candidates");

  // Helper function to check if a candidate ID is duplicate
  const isDuplicateId = (currentIndex: number, matricNo: string): boolean => {
    if (!matricNo || !watchedCandidates) return false;

    return watchedCandidates.some(
      (candidate, index) =>
        index !== currentIndex &&
        candidate.matricNo?.toLowerCase() === matricNo.toLowerCase(),
    );
  };

  // Helper function to validate candidate ID on change
  const handleMatricNoChange = async (index: number, value: string) => {
    setValue(`candidates.${index}.matricNo`, value, {
      shouldValidate: false,
    });

    // Trigger validation after a short delay to allow for typing
    setTimeout(() => {
      trigger("candidates");
    }, 300);
  };

  return (
    <FormSectionWrapper
      isValid={isValid}
      canAccess={canAccess}
      errors={errorMessages}
      title="Candidates Registration"
    >
      <Card className="bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-lg shadow-gray-400/10 dark:shadow-2xl/25">
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl text-gray-700 dark:text-gray-200">
              <Users className="w-5 h-5 text-green-400" />
              <span>Candidates Registration</span>
            </CardTitle>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-400">
                Register candidates for each position category
              </p>
              <div className="flex space-x-2">
                {/*<Button*/}
                {/*  variant="outline"*/}
                {/*  className="border-gray-600 text-gray-600 dark:text-gray-300 cursor-pointer"*/}
                {/*>*/}
                {/*  <Upload className="w-4 h-4 mr-2" />*/}
                {/*  Upload CSV*/}
                {/*</Button>*/}
                <Button
                  onClick={addCandidate}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-400 border-green-500/30 cursor-pointer"
                  disabled={validCategories.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </div>
            </div>

            {validCategories.length === 0 && (
              <div className="text-center py-8 text-yellow-500">
                Please add and complete position categories first before adding
                candidates.
              </div>
            )}

            {validCategories.length > 0 && (
              <div className="mb-4 p-3 glass-panel rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                  Available Categories:
                </p>
                <div className="flex flex-wrap gap-2">
                  {validCategories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field, index) => {
                const currentMatricNo =
                  watch(`candidates.${index}.matricNo`) || "";
                const isDuplicate = isDuplicateId(index, currentMatricNo);

                return (
                  <div
                    key={field.id}
                    className={`glass-panel p-4 rounded-lg space-y-4 ${
                      isDuplicate
                        ? "border-2 border-red-300 dark:border-red-400"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500">
                          Candidate {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Candidate Name */}
                      <div>
                        <Input
                          className={`bg-gray-50 ${errors.candidates?.[index]?.name ? "border-red-500" : ""}`}
                          placeholder="Candidate Name (e.g., John Doe)"
                          {...register(`candidates.${index}.name` as const)}
                        />
                        {errors.candidates?.[index]?.name && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.candidates[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      {/* Candidate ID */}
                      <div>
                        <Input
                          className={`bg-gray-50 ${
                            errors.candidates?.[index]?.matricNo || isDuplicate
                              ? "border-red-500"
                              : ""
                          }`}
                          placeholder="Matric Number (e.g., STU001, MAT12345)"
                          {...register(
                            `candidates.${index}.matricNo` as const,
                            {
                              onChange: (e) =>
                                handleMatricNoChange(index, e.target.value),
                            },
                          )}
                        />
                        {errors.candidates?.[index]?.matricNo && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.candidates[index]?.matricNo?.message}
                          </p>
                        )}
                        {isDuplicate &&
                          !errors.candidates?.[index]?.matricNo && (
                            <p className="text-red-400 text-sm mt-1">
                              This matric number is already used by another
                              candidate
                            </p>
                          )}
                        <p className="text-xs text-gray-500 mt-1">
                          Use unique identifiers like matric number, student ID,
                          or employee ID
                        </p>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <Select
                          value={watch(`candidates.${index}.category`) || ""}
                          onValueChange={(value) =>
                            setValue(`candidates.${index}.category`, value, {
                              shouldValidate: true,
                            })
                          }
                        >
                          <SelectTrigger
                            className={`bg-gray-50 w-full cursor-pointer ${errors.candidates?.[index]?.category ? "border-red-500" : ""}`}
                          >
                            <SelectValue placeholder="Select position category" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-blue-950 shadow-lg border-white/10">
                            {validCategories.map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                                className="cursor-pointer"
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.candidates?.[index]?.category && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.candidates[index]?.category?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {fields.length === 0 && validCategories.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                No candidates registered yet. Click &#34;Add Candidate&#34; to
                get started.
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </FormSectionWrapper>
  );
}
