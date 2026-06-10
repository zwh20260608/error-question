/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { QuestionDetail, SUBJECT_OPTIONS } from "../types";
import { Edit2, Plus, Trash2, Check, HelpCircle, BookMarked } from "lucide-react";

interface QuestionEditorProps {
  subject: string;
  setSubject: (subject: string) => void;
  knowledgePoint: string;
  setKnowledgePoint: (point: string) => void;
  question: QuestionDetail;
  setQuestion: (updater: (prev: QuestionDetail) => QuestionDetail) => void;
  onConfirm: () => void;
}

export default function QuestionEditor({
  subject,
  setSubject,
  knowledgePoint,
  setKnowledgePoint,
  question,
  setQuestion,
  onConfirm,
}: QuestionEditorProps) {
  const [newOption, setNewOption] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleUserAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev) => ({ ...prev, userAnswer: e.target.value }));
  };

  const handleCorrectAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion((prev) => ({ ...prev, correctAnswer: e.target.value }));
  };

  const handleOptionChange = (idx: number, val: string) => {
    setQuestion((prev) => {
      const updated = [...(prev.options || [])];
      updated[idx] = val;
      return { ...prev, options: updated };
    });
  };

  const removeOption = (idx: number) => {
    setQuestion((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== idx),
    }));
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption.trim()],
    }));
    setNewOption("");
  };

  return (
    <div className="bg-white rounded-[24px] border border-brand-border p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-primary rounded-xl text-white">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#4A4E3D]">确认及修正错题信息</h3>
            <p className="text-xs text-brand-secondary font-medium">请核对识别出的错题内容，可以手动进行补充或修正</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subject dropdown */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#4A4E3D] flex items-center gap-1">
            学科分类 <span className="text-rose-500">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-11 px-3 bg-brand-paper border border-brand-border rounded-xl text-[#2D2D2A] font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          >
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Knowledge point input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#4A4E3D] flex items-center gap-1">
            关联知识点 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={knowledgePoint}
            onChange={(e) => setKnowledgePoint(e.target.value)}
            placeholder="如：一元二次方程根的判别式"
            className="w-full h-11 px-4 bg-brand-paper border border-brand-border rounded-xl text-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-brand-secondary"
          />
        </div>
      </div>

      {/* Question text */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#4A4E3D] flex items-center gap-1">
          题目正文 <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={question.text}
          onChange={handleTextChange}
          rows={5}
          placeholder="请输入题目完整文本内容，可包含公式或符号..."
          className="w-full p-4 bg-brand-paper border border-brand-border rounded-xl text-[#2D2D2A] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-brand-secondary resize-y"
        />
      </div>

      {/* Options section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#4A4E3D]">选项设置（仅单选/多选题需要）</label>
          <span className="text-xs text-brand-secondary font-medium">目前共 {(question.options || []).length} 个选项</span>
        </div>

        <div className="space-y-2">
          {(question.options || []).map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <span className="text-xs font-bold text-brand-secondary w-6">选项 {String.fromCharCode(65 + idx)}</span>
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="flex-1 h-9 px-3 bg-brand-paper border border-brand-border rounded-lg text-sm text-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
              />
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                title="删除选项"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOption()}
            placeholder="输入新选项，例如：C. x > 5"
            className="flex-1 h-9 px-3 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
          />
          <button
            type="button"
            onClick={addOption}
            className="h-9 px-3 flex items-center gap-1 bg-brand-muted text-[#4A4E3D] hover:opacity-90 rounded-lg text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> 添加选项
          </button>
        </div>
      </div>

      {/* Answer Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-accent" />
            <label className="text-sm font-medium text-[#4A4E3D]">我的原答案 (选填)</label>
          </div>
          <input
            type="text"
            value={question.userAnswer || ""}
            onChange={handleUserAnswerChange}
            placeholder="输入你答错的答案，便于对比"
            className="w-full h-10 px-3 bg-brand-paper border border-brand-border rounded-lg text-sm text-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-primary" />
            <label className="text-sm font-medium text-[#4A4E3D]">标准正确答案 (选填)</label>
          </div>
          <input
            type="text"
            value={question.correctAnswer || ""}
            onChange={handleCorrectAnswerChange}
            placeholder="输入正确的标准答案"
            className="w-full h-10 px-3 bg-brand-paper border border-brand-border rounded-lg text-sm text-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-brand-border flex justify-end">
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-2.5 bg-brand-primary hover:opacity-95 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 transform active:scale-[0.98]"
        >
          <Check className="w-4 h-4" /> 确认，准备生成举一反三
        </button>
      </div>
    </div>
  );
}
