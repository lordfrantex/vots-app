"use client";

import { useState, useCallback, useRef } from "react";
import { Vote, Users, CheckCircle } from "lucide-react";

import { useElectionValidation } from "@/hooks/use-election-validation";
import { ProgressHeader } from "@/components/layouts/create-election/progress-header";
import { BasicInfoForm } from "@/components/layouts/create-election/basic-info-form";
import { CategoriesForm } from "@/components/layouts/create-election/categories-form";
import { CandidatesForm } from "@/components/layouts/create-election/candidates-form";
import { PollingSetupForm } from "@/components/layouts/create-election/polling-setup-form";
import { ReviewSummary } from "@/components/layouts/create-election/review-summary";
import { VotersForm } from "@/components/layouts/create-election/voters-form";

const steps = [
  { id: "basic", title: "Basic Info", icon: Vote },
  { id: "categories", title: "Categories", icon: Users },
  { id: "candidates", title: "Candidates", icon: Users },
  { id: "polling", title: "Polling Setup", icon: CheckCircle },
  { id: "review", title: "Review", icon: CheckCircle },
];

const sectionIds = ["basic", "categories", "candidates", "polling", "review"];

export default function CreateElectionPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic"]),
  );
  // Fix: Use proper ref typing for HTMLDivElement
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    forms,
    validationState,
    validCategories,
    currentStep,
    setCurrentStep,
    validateCompleteElection,
    canAccessSection,
  } = useElectionValidation();

  const toggleSection = useCallback(
    (sectionId: string) => {
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      setExpandedSections(newExpanded);
    },
    [expandedSections],
  );

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      const sectionId = sectionIds[stepIndex];

      // Update current step
      setCurrentStep(stepIndex);

      // Expand the target section
      setExpandedSections((prev) => new Set([...prev, sectionId]));

      // Scroll to the section
      const sectionRef = sectionRefs.current[sectionId];
      if (sectionRef) {
        sectionRef.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    },
    [setCurrentStep],
  );

  const handleSubmit = useCallback(() => {
    const validation = validateCompleteElection();
    if (validation.success) {
      console.log("Submitting election data:", validation.data);
      // Here you would call your useWriteContract hook
      // const { writeContract } = useWriteContract()
      // writeContract({
      //   functionName: 'createElection',
      //   args: [validation.data]
      // })
    } else {
      console.error("Validation errors:", validation.errors);
    }
  }, [validateCompleteElection]);

  // Helper function to set refs properly
  const setRef = (sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  };

  return (
    <section
      id="create-page"
      className="justify-center items-center min-h-screen relative pt-[7rem] lg:pt-[10rem] -mt-20"
    >
      <div className="mx-auto">
        <div className="min-h-screen">
          <ProgressHeader
            steps={steps}
            currentStep={currentStep}
            validationState={validationState}
            onStepClick={handleStepClick}
          />

          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="space-y-6">
              <div ref={setRef("basic")}>
                <BasicInfoForm
                  form={forms.basicInfo}
                  isExpanded={expandedSections.has("basic")}
                  onToggle={() => toggleSection("basic")}
                  canAccess={canAccessSection("basicInfo")}
                  isValid={validationState.basicInfo}
                />
              </div>

              <div ref={setRef("categories")}>
                <CategoriesForm
                  form={forms.categories}
                  isExpanded={expandedSections.has("categories")}
                  onToggle={() => toggleSection("categories")}
                  canAccess={canAccessSection("categories")}
                  isValid={validationState.categories}
                />
              </div>

              <div ref={setRef("candidates")}>
                <CandidatesForm
                  form={forms.candidates}
                  validCategories={validCategories}
                  isExpanded={expandedSections.has("candidates")}
                  onToggle={() => toggleSection("candidates")}
                  canAccess={canAccessSection("candidates")}
                  isValid={validationState.candidates}
                />
              </div>
              <div ref={setRef("voters")}>
                <VotersForm
                  form={forms.voters}
                  isExpanded={expandedSections.has("voters")}
                  onToggle={() => toggleSection("voters")}
                  canAccess={canAccessSection("voters")}
                  isValid={validationState.voters}
                />
              </div>
              <div ref={setRef("polling")}>
                <PollingSetupForm
                  form={forms.polling}
                  isExpanded={expandedSections.has("polling")}
                  onToggle={() => toggleSection("polling")}
                  canAccess={canAccessSection("polling")}
                  isValid={validationState.polling}
                />
              </div>

              <div ref={setRef("review")}>
                <ReviewSummary
                  electionData={{
                    name: forms.basicInfo.getValues("name"),
                    description: forms.basicInfo.getValues("description"),
                    startDate: forms.basicInfo.getValues("startDate"),
                    endDate: forms.basicInfo.getValues("endDate"),
                    timezone: forms.basicInfo.getValues("timezone"),
                    categories: forms.categories.getValues("categories"),
                    candidates: forms.candidates.getValues("candidates"),
                    pollingOfficers: forms.polling.getValues("pollingOfficers"),
                    pollingUnits: forms.polling.getValues("pollingUnits"),
                  }}
                  isExpanded={expandedSections.has("review")}
                  onToggle={() => toggleSection("review")}
                  onSubmit={handleSubmit}
                  canAccess={canAccessSection("complete")}
                  isValid={validationState.complete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
