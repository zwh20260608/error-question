/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuestionDetail {
  text: string;
  options?: string[];
  userAnswer?: string;
  correctAnswer?: string;
}

export interface VariantQuestion {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation: string; // Must focus on typical mistakes/pitfalls
}

export interface WrongQuestionRecord {
  id: string;
  subject: string;
  knowledgePoint: string;
  originalQuestion: QuestionDetail;
  originalImage?: string; // base64 string of uploaded image (optional, for visual verification)
  variants: VariantQuestion[];
  savedAt: number;
}

export const SUBJECT_OPTIONS = [
  "数学",
  "英语",
  "语文",
  "物理",
  "化学",
  "生物",
  "历史",
  "地理",
  "政治",
  "其他"
];
