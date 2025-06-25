"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Vote,
  Settings,
  ExternalLink,
} from "lucide-react";
import type { Election } from "@/types/election";

interface ReviewSummaryProps {
  electionData: Election;
  isExpanded: boolean;
  onToggle: () => void;
  onSubmit: () => void;
  canAccess: boolean;
  isValid: boolean;
  isSubmitting?: boolean;
  txHash?: `0x${string}`;
  isConfirmed?: boolean;
}

export function ReviewSummary({
  electionData,
  isExpanded,
  onToggle,
  onSubmit,
  canAccess,
  isValid,
  isSubmitting = false,
  txHash,
  isConfirmed = false,
}: ReviewSummaryProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  const getSubmitButtonVariant = () => {
    if (isConfirmed) return "default";
    return "default";
  };

  const getSubmitButtonContent = () => {
    if (isSubmitting && !txHash) {
      return (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Preparing Transaction...
        </>
      );
    }

    if (isSubmitting && txHash && !isConfirmed) {
      return (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Confirming Transaction...
        </>
      );
    }

    if (isConfirmed) {
      return (
        <>
          <svg
            className="animate-bounce -ml-1 mr-3 h-5 w-5 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Election Created!
        </>
      );
    }

    return "Create Election";
  };

  return (
    <Card
      className={`transition-all duration-200 bg-gray-50 dark:bg-gray-900 py-6 rounded-lg shadow-lg shadow-gray-400/10 dark:shadow-2xl/25 ${!canAccess ? "opacity-50" : ""}`}
    >
      <CardHeader
        className="cursor-pointer"
        onClick={canAccess ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isValid ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
            >
              <Vote className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-3 text-xl text-gray-700 dark:text-gray-200">
                Review & Submit
              </CardTitle>
              <CardDescription>
                Review your election details and submit to blockchain
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isValid && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Complete
              </Badge>
            )}
            {canAccess &&
              (isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              ))}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <h3 className="font-semibold">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <p className="text-sm text-muted-foreground">Election Name</p>
                <p className="font-medium">{electionData.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">
                  {electionData.description || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {formatDate(electionData.startDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {formatDate(electionData.endDate)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="font-semibold">Position Categories</h3>
            </div>
            <div className="pl-6">
              <div className="flex flex-wrap gap-2">
                {electionData.categories?.map((category) => (
                  <Badge key={category.id} variant="outline">
                    {category.name}
                  </Badge>
                )) || (
                  <p className="text-muted-foreground">No categories set</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Candidates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              <h3 className="font-semibold">
                Candidates ({electionData.candidates?.length || 0})
              </h3>
            </div>
            <div className="pl-6">
              {electionData.candidates?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {electionData.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.matricNo}
                        </p>
                      </div>
                      <Badge variant="secondary">{candidate.category}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No candidates added</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Voters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="font-semibold">
                Registered Voters ({electionData.voters?.length || 0})
              </h3>
            </div>
            <div className="pl-6">
              <p className="text-muted-foreground">
                {electionData.voters?.length || 0} voters registered for this
                election
              </p>
            </div>
          </div>

          <Separator />

          {/* Polling Setup */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="font-semibold">Polling Setup</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Polling Officers
                </p>
                <p className="font-medium">
                  {electionData.pollingOfficers?.length || 0} officers
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Polling Units</p>
                <p className="font-medium">
                  {electionData.pollingUnits?.length || 0} units
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {txHash && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <h3 className="font-semibold">Transaction Status</h3>
                </div>
                <div className="pl-6 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transaction Hash
                    </p>
                    <p className="font-mono text-sm break-all">{txHash}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={isConfirmed ? "default" : "secondary"}>
                      {isConfirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-between">
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                ⚠️ Once submitted, this election data will be immutable on the
                blockchain
              </p>
            </div>
            <Button
              onClick={onSubmit}
              disabled={!isValid || isSubmitting || isConfirmed}
              size="lg"
              className={`min-w-[200px] flex items-center justify-center cursor-pointer ${
                isConfirmed ? "bg-green-600 hover:bg-green-700 text-white" : ""
              }`}
            >
              {getSubmitButtonContent()}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
