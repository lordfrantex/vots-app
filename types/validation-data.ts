import type {
  BasicInfoFormData,
  CategoriesFormData,
  CandidatesFormData,
  VotersFormData,
  PollingSetupFormData,
} from "@/lib/validation-schemas";

export interface ValidationData {
  basicInfo: BasicInfoFormData;
  categories: CategoriesFormData;
  candidates: CandidatesFormData;
  voters: VotersFormData;
  polling: PollingSetupFormData;
}
