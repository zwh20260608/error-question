/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { QuestionDetail, VariantQuestion, WrongQuestionRecord } from "../types";
import { Sparkles, Loader2, RotateCw, Save, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import SubjectBadge from "./SubjectBadge";

interface VariantGeneratorViewProps {
  subject: string;
  knowledgePoint: string;
  originalQuestion: QuestionDetail;
  originalImage?: string;
  onSaveRecord: (record: Omit<WrongQuestionRecord, "id" | "savedAt">) => void;
  onReset: () => void;
}

export default function VariantGeneratorView({
  subject,
  knowledgePoint,
  originalQuestion,
  originalImage,
  onSaveRecord,
  onReset,
}: VariantGeneratorViewProps) {
  const [variants, setVariants] = useState<VariantQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loadingTip, setLoadingTip] = useState("");

  const loadingTips = [
    "正在分析原题知识点及思维考点...",
    "正在结合《大纲》构建多维度相似梯度题目...",
    "正在梳理本知识点高频考错诱因...",
    "正在编写易错剖析以及详细解析...",
  ];

  const generateVariants = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    // Dynamic rotation of loading tips
    let tipIdx = 0;
    setLoadingTip(loadingTips[0]);
    const tipInterval = setInterval(() => {
      tipIdx = (tipIdx + 1) % loadingTips.length;
      setLoadingTip(loadingTips[tipIdx]);
    }, 2800);

    try {
      const response = await fetch("/api/generate-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalQuestion.text,
          options: originalQuestion.options,
          correctAnswer: originalQuestion.correctAnswer,
          knowledgePoint,
          subject,
        }),
      });

      const data = await response.json();
      clearInterval(tipInterval);

      if (!response.ok || data.error) {
        throw new Error(data.error || "生成失败，大模型服务可能繁忙。");
      }

      // Generate localized random IDs
      const formattedVariants: VariantQuestion[] = (data.variants || []).map((v: any, idx: number) => ({
        id: `var-${Date.now()}-${idx}`,
        text: v.text,
        options: v.options || [],
        correctAnswer: v.correctAnswer,
        explanation: v.explanation,
      }));

      setVariants(formattedVariants);
    } catch (err: any) {
      clearInterval(tipInterval);
      setError(err.message || "请求服务器发生未知错误，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (variants.length === 0) return;
    onSaveRecord({
      subject,
      knowledgePoint,
      originalQuestion,
      originalImage,
      variants,
    });
    setSaved(true);
  };

  // Helper function to render explanations highlighting the "【易错点剖析】" text.
  const renderExplanation = (explanation: string) => {
    const keyword = "【易错点剖析】";
    if (explanation.includes(keyword)) {
      const parts = explanation.split(keyword);
      return (
        <div className="space-y-3">
          <div className="text-[#2D2D2A] leading-relaxed text-sm">
            {parts[0]}
          </div>
          <div className="p-3.5 bg-brand-highlight/40 border-l-4 border-brand-accent rounded-r-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#CB997E] text-xs font-bold font-sans">
              <AlertCircle className="w-4 h-4 text-brand-accent shrink-0" />
              <span>经典易错点警示</span>
            </div>
            <p className="text-[#4A4E3D] text-sm leading-relaxed font-semibold">
              {parts[1]}
            </p>
          </div>
        </div>
      );
    }

    // Fallback split for colon or similar
    const alternateKeywords = ["易错点分析：", "易错点：", "注意："];
    for (const kw of alternateKeywords) {
      if (explanation.includes(kw)) {
        const parts = explanation.split(kw);
        return (
          <div className="space-y-3">
            <div className="text-[#2D2D2A] leading-relaxed text-sm">{parts[0]}</div>
            <div className="p-3.5 bg-brand-highlight/40 border-l-4 border-brand-accent rounded-r-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#CB997E] text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-brand-accent shrink-0" />
                <span>易错点提示</span>
              </div>
              <p className="text-[#4A4E3D] text-sm leading-relaxed font-semibold">{parts[1]}</p>
            </div>
          </div>
        );
      }
    }

    return <p className="text-[#2D2D2A] leading-relaxed text-sm font-sans">{explanation}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Subject and summary bar */}
      <div className="bg-white border border-brand-border rounded-[24px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-none">
        <div className="flex items-center gap-3">
          <SubjectBadge subject={subject} />
          <div>
            <h4 className="text-sm font-semibold text-[#4A4E3D] font-sans">
              核心知识点：<span className="text-brand-primary font-bold">{knowledgePoint}</span>
            </h4>
            <p className="text-xs text-brand-secondary font-medium mt-0.5">确认知识点合理后，一键生成精练习题</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-brand-secondary hover:text-brand-primary underline flex items-center gap-1 px-3 py-1.5 hover:bg-brand-muted rounded-full transition-all self-end sm:self-auto font-medium"
        >
          重新导入错题
        </button>
      </div>

      {variants.length === 0 && !loading && (
        <div className="bg-white rounded-[24px] border border-brand-border p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-brand-muted text-brand-primary rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 animate-pulse text-brand-primary" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-[#4A4E3D]">万事俱备，点击一键生成</h3>
            <p className="text-sm text-brand-secondary font-medium">
              大模型将基于错题的知识点 <strong>“{knowledgePoint}”</strong> 智能生成 3 道难度匹配、角度不同的核心变式练习，并带经典易错点解析。
            </p>
          </div>
          <button
            onClick={generateVariants}
            className="px-6 py-3 bg-brand-primary text-white font-bold rounded-full shadow-sm hover:opacity-95 transition-all transform active:scale-95 inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> 智能生成“举一反三”
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-[24px] border border-brand-border p-12 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-brand-muted rounded-full" />
            <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h4 className="text-[#4A4E3D] font-bold animate-pulse">{loadingTip}</h4>
            <p className="text-xs text-brand-secondary">大模型正在针对学科薄弱点进行专项精研，约需 10-15 秒，请稍候...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-brand-highlight/20 border border-brand-accent/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm text-[#4A4E3D] font-semibold">{error}</p>
            <button
              onClick={generateVariants}
              className="px-3 py-1.5 bg-brand-highlight text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-highlight/80 transition-all flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> 重新尝试
            </button>
          </div>
        </div>
      )}

      {/* Variant results list */}
      {variants.length > 0 && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#4A4E3D] flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              举一反三变式练习题
            </h3>
            <div className="flex items-center gap-2">
              <button
                disabled={saved}
                onClick={handleSave}
                className={`h-9 px-5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 transform active:scale-95 ${
                  saved
                    ? "bg-brand-primary/80 text-white shadow-none cursor-default"
                    : "bg-brand-accent text-white shadow-sm hover:opacity-95"
                }`}
              >
                {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "已保存到错题本" : "保存本套错题"}
              </button>
              <button
                onClick={generateVariants}
                className="h-9 px-4 bg-white border border-brand-border text-brand-primary rounded-full text-sm font-semibold hover:bg-brand-muted transition-all flex items-center gap-1.5"
                title="重新生成 3 道题"
              >
                <RotateCw className="w-4 h-4" />
                重新生成
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {variants.map((v, idx) => (
              <div
                key={v.id}
                className="bg-white rounded-[24px] border border-brand-border p-6 space-y-4 relative overflow-hidden group hover:border-[#CB997E]/30 transition-all"
              >
                {/* Variant card header */}
                <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
                  <span className="text-xs font-bold text-brand-primary bg-brand-muted px-3 py-1 rounded-full uppercase tracking-tight">
                    变式精练 {idx + 1}
                  </span>
                  <span className="text-xs text-brand-secondary font-medium">同知识点覆盖</span>
                </div>

                {/* Question body */}
                <div className="space-y-3">
                  <p className="text-[#2D2D2A] font-bold leading-relaxed font-sans text-sm whitespace-pre-wrap">
                    {v.text}
                  </p>

                  {/* Options if choosing */}
                  {v.options && v.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {v.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="p-3 bg-brand-paper border border-brand-border/60 rounded-xl text-xs text-[#4A4E3D] flex items-start gap-2 font-medium"
                        >
                          <span className="font-bold text-brand-primary">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt.replace(/^[A-Da-d][.\s:]*/, "")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Answers and explanations with easy fault highlighting */}
                <div className="bg-brand-paper rounded-xl p-4 border border-dashed border-brand-border/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-brand-muted text-[#4A4E3D] font-bold rounded-lg text-xs border border-brand-border/40">
                      参考答案
                    </span>
                    <span className="text-sm font-bold text-brand-primary font-mono">
                      {v.correctAnswer}
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-brand-border/40 pt-3">
                    <h5 className="text-xs font-bold text-brand-secondary">试题深度解析</h5>
                    {renderExplanation(v.explanation)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-brand-muted border border-brand-border rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <h5 className="text-sm font-bold text-[#4A4E3D]">去复习这些错题？</h5>
              <p className="text-xs text-brand-secondary font-medium mt-0.5">保存后可以前往“全科错题本”下载 PDF 打印出实体试卷精练</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                saved
                  ? "bg-brand-paper text-brand-secondary border border-brand-border cursor-default shadow-none"
                  : "bg-brand-accent text-white hover:opacity-95"
              }`}
            >
              {saved ? "已保存" : "保存整套错题"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

