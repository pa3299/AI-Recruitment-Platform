
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

export interface CompanyProfile {
  name: string;
  culture: string;
  orgStructure: string;
  guidelines: string;
  files: FileMetadata[];
}

export interface BiasSuggestion {
  biasedPhrase: string;
  neutralSuggestion: string;
  biasType: string;
}

export interface AuditResult {
  biasScore?: number;
  riskLevel?: string;
  suggestions?: BiasSuggestion[];
  revisedJobDescription?: string;
  error?: string;
}

export interface FeedbackPipelineEntry {
  id: number;
  type: 'feedback';
  candidateName: string;
  jobTitle: string;
  applicationStatus: 'HIRED' | 'REJECTED';
  feedbackMessage: string;
}

export interface ProfilePipelineEntry {
  id: number;
  type: 'profile';
  candidateName: string;
  anonymizedResult: string;
  fitSummaryResult: string;
}

export type PipelineEntry = FeedbackPipelineEntry | ProfilePipelineEntry;

export interface Pipelines {
  [pipelineName: string]: PipelineEntry[];
}

export interface Base64File {
  name: string;
  base64: string;
  mimeType: string;
}

export interface CandidateMatch {
    candidateId: number;
    matchScore: number;
    justification: string;
}

export interface CandidateMatchResult {
    recommendations: CandidateMatch[];
}

export interface RecommendedCandidate extends ProfilePipelineEntry {
    matchScore: number;
    justification: string;
    pipelineName: string;
}
