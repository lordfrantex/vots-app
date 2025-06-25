"use client";

import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { PollingSetupFormData } from "@/lib/validation-schemas";
import { FormSectionWrapper } from "@/components/layouts/create-election/form-section-wrapper";

interface PollingSetupFormProps {
  form: UseFormReturn<PollingSetupFormData>;
  isExpanded: boolean;
  onToggle: () => void;
  canAccess: boolean;
  isValid: boolean;
}

export function PollingSetupForm({
  form,
  isExpanded,
  onToggle,
  canAccess,
  isValid,
}: PollingSetupFormProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const {
    fields: officerFields,
    append: appendOfficer,
    remove: removeOfficer,
  } = useFieldArray({
    control,
    name: "pollingOfficers",
  });

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: "pollingUnits",
  });

  const addPollingOfficer = () => {
    appendOfficer({ id: Date.now().toString(), address: "", role: "officer" });
  };

  const addPollingUnit = () => {
    appendUnit({ id: Date.now().toString(), address: "", name: "" });
  };

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter(Boolean) as string[];

  // canAccess = true; // Assuming canAccess is always true for this example

  return (
    <FormSectionWrapper
      isValid={isValid}
      canAccess={canAccess}
      errors={errorMessages}
      title="Polling Setup"
    >
      <Card className="bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-lg shadow-gray-400/10 dark:shadow-2xl/25">
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl text-gray-700 dark:text-gray-200">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              <span>Polling Setup</span>
            </CardTitle>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Polling Officers */}
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Polling Officers</h3>
                  <Button
                    onClick={addPollingOfficer}
                    size="sm"
                    className="neumorphic-button bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-400 border-purple-500/30"
                    disabled={officerFields.length >= 20}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {officerFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Input
                        className={`neumorphic-input text-sm flex-1 ${
                          errors.pollingOfficers?.[index]?.address
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="0x... Wallet Address"
                        {...register(
                          `pollingOfficers.${index}.address` as const,
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOfficer(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {errors.pollingOfficers?.[index]?.address && (
                        <p className="text-red-400 text-xs">
                          {errors.pollingOfficers[index]?.address?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {officerFields.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No officers added yet.
                  </div>
                )}

                {officerFields.length >= 20 && (
                  <p className="text-yellow-400 text-xs text-center mt-2">
                    Maximum 20 officers allowed
                  </p>
                )}
              </div>

              {/* Polling Units */}
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Polling Units</h3>
                  <Button
                    onClick={addPollingUnit}
                    size="sm"
                    className="neumorphic-button bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-400 border-purple-500/30"
                    disabled={unitFields.length >= 50}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {unitFields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          className={`neumorphic-input text-sm flex-1 ${
                            errors.pollingUnits?.[index]?.name
                              ? "border-red-500"
                              : ""
                          }`}
                          placeholder="Unit Name"
                          {...register(`pollingUnits.${index}.name` as const)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnit(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        className={`neumorphic-input text-sm ${
                          errors.pollingUnits?.[index]?.address
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="0x... Wallet Address"
                        {...register(`pollingUnits.${index}.address` as const)}
                      />
                      {errors.pollingUnits?.[index]?.name && (
                        <p className="text-red-400 text-xs">
                          {errors.pollingUnits[index]?.name?.message}
                        </p>
                      )}
                      {errors.pollingUnits?.[index]?.address && (
                        <p className="text-red-400 text-xs">
                          {errors.pollingUnits[index]?.address?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {unitFields.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No units added yet.
                  </div>
                )}

                {unitFields.length >= 50 && (
                  <p className="text-yellow-400 text-xs text-center mt-2">
                    Maximum 50 units allowed
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </FormSectionWrapper>
  );
}
