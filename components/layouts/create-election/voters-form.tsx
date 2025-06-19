"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Plus,
  Trash2,
  Upload,
  Download,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { VotersFormData } from "@/lib/validation-schemas";
import { Voter } from "@/types/voter";
import { FormSectionWrapper } from "@/components/layouts/create-election/form-section-wrapper";

interface VotersFormProps {
  form: UseFormReturn<VotersFormData>;
  isExpanded: boolean;
  onToggle: () => void;
  canAccess: boolean;
  isValid: boolean;
}

export function VotersForm({
  form,
  isExpanded,
  onToggle,
  canAccess,
  isValid,
}: VotersFormProps) {
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "voters",
  });

  const watchedVoters = watch("voters");

  // Filter voters based on search term
  const filteredVoters = fields.filter((_, index) => {
    if (!searchTerm) return true;
    const voter = watchedVoters[index];
    if (!voter) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      voter.name?.toLowerCase().includes(searchLower) ||
      voter.matricNumber?.toLowerCase().includes(searchLower) ||
      voter.email?.toLowerCase().includes(searchLower) ||
      voter.department?.toLowerCase().includes(searchLower)
    );
  });

  const addVoter = () => {
    append({
      id: Date.now().toString(),
      name: "",
      matricNumber: "",
      email: "",
      department: "",
    });
    setEditingIndex(fields.length); // Set new voter to editing mode
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError(null);
    setCsvSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          setCsvError(
            "CSV file must contain at least a header row and one data row",
          );
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const requiredHeaders = ["name", "matricnumber"];

        // Check for required headers
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header),
        );
        if (missingHeaders.length > 0) {
          setCsvError(`Missing required columns: ${missingHeaders.join(", ")}`);
          return;
        }

        const voters: Voter[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length < requiredHeaders.length) continue;

          const voter: Voter = {
            id: Date.now().toString() + i,
            name: "",
            matricNumber: "",
            email: "",
            department: "",
          };

          headers.forEach((header, index) => {
            const value = values[index] || "";
            switch (header) {
              case "name":
                voter.name = value;
                break;
              case "matricnumber":
                voter.matricNumber = value;
                break;
              case "email":
                voter.email = value;
                break;
              case "department":
                voter.department = value;
                break;
            }
          });

          // Basic validation
          if (!voter.name || voter.name.length < 2) {
            errors.push(`Row ${i + 1}: Invalid name`);
            continue;
          }
          if (!voter.matricNumber || voter.matricNumber.length < 3) {
            errors.push(`Row ${i + 1}: Invalid matric number`);
            continue;
          }

          voters.push(voter);
        }

        if (errors.length > 0) {
          setCsvError(
            `Validation errors:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ""}`,
          );
          return;
        }

        if (voters.length === 0) {
          setCsvError("No valid voter records found in CSV");
          return;
        }

        if (voters.length > 10000) {
          setCsvError("Maximum 10,000 voters allowed");
          return;
        }

        // Check for duplicate matric numbers
        const matricNumbers = voters.map((v) => v.matricNumber.toLowerCase());
        const duplicates = matricNumbers.filter(
          (item, index) => matricNumbers.indexOf(item) !== index,
        );
        if (duplicates.length > 0) {
          setCsvError(
            `Duplicate matric numbers found: ${[...new Set(duplicates)].join(", ")}`,
          );
          return;
        }

        replace(voters);
        setCsvSuccess(`Successfully imported ${voters.length} voters`);
        setSearchTerm(""); // Clear search when new data is loaded
      } catch {
        setCsvError("Error parsing CSV file. Please check the format.");
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent =
      "name,matricnumber,email,department\nJohn Doe,CS/2020/001,john@example.com,Computer Science\nJane Smith,EE/2020/002,jane@example.com,Electrical Engineering";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voters_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCellEdit = (index: number, field: string, value: string) => {
    setValue(`voters.${index}.${field}` as any, value, {
      shouldValidate: true,
    });
  };

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter(Boolean) as string[];

  return (
    <FormSectionWrapper
      isValid={isValid}
      canAccess={canAccess}
      errors={errorMessages}
      title="Voters Registration"
    >
      <Card className="bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-lg shadow-gray-400/10 dark:shadow-2xl/25">
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl text-gray-700 dark:text-gray-200">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Voters Registration</span>
            </CardTitle>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            {/* Upload Section */}
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Bulk Import</h3>
                  <p className="text-gray-400 text-sm">
                    Upload a CSV file with voter information
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    className="border-gray-600 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Template
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className=" bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </Button>
                </div>
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />

              <div className="text-sm text-gray-400">
                <p className="mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    <strong>Required columns:</strong> name, matricnumber
                  </li>
                  <li>
                    <strong>Optional columns:</strong> email, department
                  </li>
                  <li>Maximum 10,000 voters per upload</li>
                  <li>Matric numbers must be unique</li>
                </ul>
              </div>

              {csvError && (
                <Alert className="border-red-500/30 bg-red-500/10 mt-4">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 whitespace-pre-line">
                    {csvError}
                  </AlertDescription>
                </Alert>
              )}

              {csvSuccess && (
                <Alert className="border-green-500/30 bg-green-500/10 mt-4">
                  <AlertCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {csvSuccess}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-10 w-64"
                    placeholder="Search voters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {fields.length > 0 && (
                  <div className="text-sm dark:text-gray-300">
                    <strong>{filteredVoters.length.toLocaleString()}</strong> of{" "}
                    <strong>{fields.length.toLocaleString()}</strong> voters
                    {searchTerm && " (filtered)"}
                  </div>
                )}
              </div>

              <Button
                onClick={addVoter}
                className=" bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
                disabled={fields.length >= 10000}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Voter
              </Button>
            </div>

            {/* Voters Table */}
            {fields.length > 0 ? (
              <div className="glass-panel rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-blue-950/30 dark:bg-slate-800/90 backdrop-blur-sm border-b border-white/10">
                        <tr>
                          <th className="text-left p-3 text-gray-100 dark:text-gray-300 font-medium min-w-[50px]">
                            #
                          </th>
                          <th className="text-left p-3 text-gray-100 dark:text-gray-300 font-medium min-w-[200px]">
                            Name <span className="text-red-400">*</span>
                          </th>
                          <th className="text-left p-3 text-gray-100 dark:text-gray-300 font-medium min-w-[150px]">
                            Matric Number{" "}
                            <span className="text-red-400">*</span>
                          </th>
                          <th className="text-left p-3 text-gray-100 dark:text-gray-300 font-medium min-w-[200px]">
                            Email
                          </th>
                          <th className="text-left p-3 text-gray-100 dark:text-gray-300 font-medium min-w-[150px]">
                            Department
                          </th>
                          <th className="text-left p-3 text-gray-100 dark:text-gray-300 font-medium min-w-[80px]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVoters.map((field, filteredIndex) => {
                          // Find the actual index in the original array
                          const actualIndex = fields.findIndex(
                            (f) => f.id === field.id,
                          );
                          const voter = watchedVoters[actualIndex];
                          const isEditing = editingIndex === actualIndex;
                          const hasErrors = errors.voters?.[actualIndex];

                          return (
                            <tr
                              key={field.id}
                              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                                hasErrors ? "bg-red-500/5" : ""
                              }`}
                            >
                              <td className="p-3 text-gray-400">
                                {actualIndex + 1}
                              </td>

                              <td className="p-3">
                                <Input
                                  className={`text-sm h-8 ${
                                    errors.voters?.[actualIndex]?.name
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="Full Name"
                                  value={voter?.name || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      actualIndex,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  onFocus={() => setEditingIndex(actualIndex)}
                                  onBlur={() => setEditingIndex(null)}
                                />
                                {errors.voters?.[actualIndex]?.name && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {errors.voters[actualIndex]?.name?.message}
                                  </p>
                                )}
                              </td>

                              <td className="p-3">
                                <Input
                                  className={`text-sm h-8 ${
                                    errors.voters?.[actualIndex]?.matricNumber
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="Matric Number"
                                  value={voter?.matricNumber || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      actualIndex,
                                      "matricNumber",
                                      e.target.value,
                                    )
                                  }
                                  onFocus={() => setEditingIndex(actualIndex)}
                                  onBlur={() => setEditingIndex(null)}
                                />
                                {errors.voters?.[actualIndex]?.matricNumber && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {
                                      errors.voters[actualIndex]?.matricNumber
                                        ?.message
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="p-3">
                                <Input
                                  className={`text-sm h-8 ${
                                    errors.voters?.[actualIndex]?.email
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="Email (optional)"
                                  type="email"
                                  value={voter?.email || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      actualIndex,
                                      "email",
                                      e.target.value,
                                    )
                                  }
                                  onFocus={() => setEditingIndex(actualIndex)}
                                  onBlur={() => setEditingIndex(null)}
                                />
                                {errors.voters?.[actualIndex]?.email && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {errors.voters[actualIndex]?.email?.message}
                                  </p>
                                )}
                              </td>

                              <td className="p-3">
                                <Input
                                  className={`text-sm h-8 ${
                                    errors.voters?.[actualIndex]?.department
                                      ? "border-red-500"
                                      : ""
                                  }`}
                                  placeholder="Department (optional)"
                                  value={voter?.department || ""}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      actualIndex,
                                      "department",
                                      e.target.value,
                                    )
                                  }
                                  onFocus={() => setEditingIndex(actualIndex)}
                                  onBlur={() => setEditingIndex(null)}
                                />
                                {errors.voters?.[actualIndex]?.department && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {
                                      errors.voters[actualIndex]?.department
                                        ?.message
                                    }
                                  </p>
                                )}
                              </td>

                              <td className="p-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(actualIndex)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table Footer */}
                <div className="border-t border-white/10 p-3 bg-blue-950/10 dark:bg-slate-800/50">
                  <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-400">
                    <span>
                      {searchTerm
                        ? `Showing ${filteredVoters.length} of ${fields.length} voters`
                        : `Total: ${fields.length.toLocaleString()} voters`}
                    </span>
                    {fields.length >= 10000 && (
                      <span className="text-yellow-400">
                        Maximum capacity reached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-medium mb-2">
                  No voters registered yet
                </h3>
                <p className="text-sm mb-4">
                  Upload a CSV file or add voters manually to get started
                </p>
                <Button
                  onClick={addVoter}
                  className=" bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Voter
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </FormSectionWrapper>
  );
}
