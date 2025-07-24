"use client";

import { ChevronDown, ChevronRight, Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { FormSectionWrapper } from "@/components/layouts/create-election/form-section-wrapper";
import { CategoriesFormData } from "@/lib/validation-schemas";

interface CategoriesFormProps {
  form: UseFormReturn<CategoriesFormData>;
  isExpanded: boolean;
  onToggle: () => void;
  canAccess: boolean;
  isValid: boolean;
}

export function CategoriesForm({
  form,
  isExpanded,
  onToggle,
  canAccess,
  isValid,
}: CategoriesFormProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  });

  const addCategory = () => {
    append({ id: Date.now().toString(), name: "" });
  };

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter(Boolean) as string[];

  return (
    <FormSectionWrapper
      isValid={isValid}
      canAccess={canAccess}
      errors={errorMessages}
      title="Position Categories"
    >
      <Card className="bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-lg shadow-gray-400/10 dark:shadow-2xl/25">
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl text-gray-700 dark:text-gray-200">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Position Categories</span>
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
                Add position categories for your election
              </p>
              <Button
                onClick={addCategory}
                className="neumorphic-button bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 border-blue-500/30"
                // disabled={fields.length >= 10}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center space-x-3 p-4 glass-panel rounded-lg"
                >
                  <Input
                    className={`neumorphic-input flex-1 ${errors.categories?.[index]?.name ? "border-red-500" : ""}`}
                    placeholder="Category name (e.g., President, Treasurer)"
                    {...register(`categories.${index}.name` as const)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {errors.categories?.[index]?.name && (
                    <p className="text-red-400 text-sm">
                      {errors.categories[index]?.name?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No categories added yet. Click &#34;Add Category&#34; to get
                started.
              </div>
            )}

            {/*{fields.length >= 10 && (*/}
            {/*  <p className="text-yellow-400 text-sm text-center">*/}
            {/*    Maximum 10 categories allowed*/}
            {/*  </p>*/}
            {/*)}*/}
          </CardContent>
        )}
      </Card>
    </FormSectionWrapper>
  );
}
