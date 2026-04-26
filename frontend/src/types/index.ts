export type InterviewPersonality = "friendly" | "normal" | "strict";
export type InterviewMode = "text" | "voice";
export type InterviewRound = "theory" | "coding";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export type InterviewQuestion = {
  id: number;
  question: string;
  difficulty: QuestionDifficulty;
};

export type InterviewReview = {
  summary: string;
  strengths: string[];
  problems: string[];
  improvements: string[];
  interviewer_note: string;
  recommended_next_step: string;
  malpractice_note: string | null;
};

export type SessionSnapshot = {
  answered_count: number;
  average_score: number;
  average_response_time: number;
  strengths: string[];
  focus_areas: string[];
  recent_scores: number[];
  completion_rate: number;
  recommended_difficulty: QuestionDifficulty;
  current_personality: InterviewPersonality;
  asked_question_ids: Record<string, number[]>;
  current_question_id: number | null;
  current_round: InterviewRound;
  current_time_limit: number;
  warnings: number;
  warning_limit: number;
  terminated: boolean;
  termination_reason: string | null;
  target_questions: number;
  round_breakdown: Record<string, number>;
  status: "ready" | "active" | "completed" | "terminated";
  last_warning_reason: string | null;
};

export type NextQuestionResponse = {
  question: InterviewQuestion;
  difficulty: QuestionDifficulty;
  personality: InterviewPersonality;
  round_type: InterviewRound;
  time_limit: number;
  session: SessionSnapshot;
};

export type SubmitAnswerRequest = {
  question_id: number;
  answer: string;
  response_time: number;
  time_limit: number;
  round_type: InterviewRound;
  code?: string;
  stdin?: string;
  compile_stdout?: string;
  compile_stderr?: string;
  compiled_successfully?: boolean;
  malpractice_count?: number;
};

export type SubmitAnswerResponse = {
  features: {
    word_count: number;
    avg_word_length: number;
    response_time: number;
    time_limit: number;
    pressure_ratio: number;
    is_short_answer: boolean;
    under_pressure: boolean;
    round_type: InterviewRound;
    code_length: number;
    line_count: number;
    compiled_successfully: boolean;
    compile_attempted: boolean;
    compile_stdout: string;
    compile_stderr: string;
    has_explanation: boolean;
  };
  evaluation: {
    score: number;
    feedback: string[];
  };
  session_insights: string[];
  coaching_tip: string;
  session: SessionSnapshot;
  review: InterviewReview;
};

export type SessionActionResponse = {
  session: SessionSnapshot;
  review: InterviewReview;
  terminated: boolean;
  message: string;
};

export type CompileResponse = {
  compiled_successfully: boolean;
  stdout: string;
  stderr: string;
  compile_stdout: string;
  compile_stderr: string;
  exit_code: number | null;
  timed_out: boolean;
  compiler_available: boolean;
  language: string;
};

export type AtsResponse = {
  overall_match: number;
  hard_skills_match: number;
  content_similarity: number;
  semantic_similarity: number;
  found_skills: string[];
  missing_skills: string[];
  suggestion: string;
  parsed_resume_length: number;
  semantic_engine: string;
};

export type StoredSessionReport = {
  session: SessionSnapshot;
  review: InterviewReview;
  message: string | null;
  coaching_tip?: string;
  session_insights?: string[];
  evaluation?: SubmitAnswerResponse["evaluation"] | null;
  latest_round?: InterviewRound;
};
