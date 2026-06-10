/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WrongQuestionRecord } from "../types";
import { X, Printer, Eye, Settings, HelpCircle, FileText, Check } from "lucide-react";
import SubjectBadge from "./SubjectBadge";

interface PrintPreviewModalProps {
  selectedRecords: WrongQuestionRecord[];
  onClose: () => void;
}

export default function PrintPreviewModal({ selectedRecords, onClose }: PrintPreviewModalProps) {
  const [sheetTitle, setSheetTitle] = useState("专项提分·错题举一反三精练卷");
  const [mode, setMode] = useState<"exercise" | "solution">("exercise"); // 'exercise' = answers at the appendix; 'solution' = answers follow questions
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [showDraftLine, setShowDraftLine] = useState(true); // Shows a dashed box for child to write answers on

  const handlePrint = () => {
    // We will trigger browser print.
    // To make sure it works gracefully, we have print-specific styles injected and visible only during print.
    window.print();
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto p-4 md:p-6 flex items-center justify-center font-sans">
      {/* Printable Area CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-preview-content, #print-preview-content * {
            visibility: visible !important;
          }
          #print-preview-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      <div className="bg-brand-bg w-full max-w-5xl rounded-[24px] shadow-xl flex flex-col max-h-[92vh] overflow-hidden no-print border border-brand-border">
        {/* Header bar */}
        <div className="bg-white border-b border-brand-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="font-bold text-[#4A4E3D]">打印排版预览</h3>
              <p className="text-xs text-brand-secondary font-medium">已选中 {selectedRecords.length} 组错题</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-secondary hover:text-brand-primary hover:bg-brand-muted rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configurations layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Sidebar controls */}
          <div className="w-full md:w-80 bg-white border-r border-brand-border p-6 space-y-6 shrink-0 no-print">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> 打印样式与排版配置
              </h4>

              {/* Sheet Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A4E3D]">试卷标题</label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  placeholder="请输入您的试卷标题"
                  className="w-full px-3 py-2 bg-brand-paper border border-brand-border rounded-lg text-xs font-medium text-[#2D2D2A] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>

              {/* Mode Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A4E3D]">排版模式</label>
                <div className="grid grid-cols-2 gap-2 bg-brand-muted p-1 rounded-xl">
                  <button
                    onClick={() => setMode("exercise")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === "exercise"
                        ? "bg-white text-brand-primary shadow-xs border border-brand-border/40"
                        : "text-brand-secondary hover:text-brand-primary"
                    }`}
                  >
                    学生练习卷
                  </button>
                  <button
                    onClick={() => setMode("solution")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === "solution"
                        ? "bg-white text-brand-primary shadow-xs border border-brand-border/40"
                        : "text-brand-secondary hover:text-brand-primary"
                    }`}
                  >
                    教师解析卷
                  </button>
                </div>
                <p className="text-[10px] text-brand-secondary leading-normal mt-1 font-medium">
                  {mode === "exercise"
                    ? "【练习卷】将收起答案，统一归类并排版在试卷最后一页，不影响学生做题，支持打印作答。"
                    : "【解析卷】答案与名师易错解析紧跟在对应的每道题目下方，便于复习、对照。"
                  }
                </p>
              </div>

              {/* Font size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A4E3D]">主名字号字径</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["sm", "md", "lg"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`py-1 rounded-lg text-xs leading-none font-bold capitalize transition-all border ${
                        fontSize === sz
                          ? "bg-brand-muted border-brand-primary text-brand-primary font-bold"
                          : "bg-white border-brand-border text-brand-secondary hover:bg-brand-paper"
                      }`}
                    >
                      {sz === "sm" ? "小" : sz === "md" ? "中" : "大"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft Box Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-[#4A4E3D]">留白答题区域</label>
                  <p className="text-[10px] text-brand-secondary font-medium">预留书写框，辅助动手作答</p>
                </div>
                <button
                  onClick={() => setShowDraftLine(!showDraftLine)}
                  className={`w-9 h-5 rounded-full transition-all relative ${
                    showDraftLine ? "bg-brand-primary" : "bg-brand-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                      showDraftLine ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-brand-border pt-6 space-y-3.5">
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl text-xs shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" /> 唤醒系统打印 / 保存 PDF
              </button>

              <div className="p-4 bg-brand-highlight/20 rounded-xl text-[10px] text-[#4A4E3D] space-y-1 border border-brand-highlight/30">
                <p className="font-bold text-brand-accent">💡 提示与技巧：</p>
                <p>1. 在弹出的系统打印界面中，可选择 <strong>“另存为 PDF”</strong> 达成数字化保存。</p>
                <p>2. 建议勾选 <strong>“隐藏页眉页脚”</strong> 以及 <strong>“背景图形”</strong> 以得到最优雅无暇的练习版面。</p>
                <p>3. 遇到 iframe 阻碍时，请尝试在外部新标签页中右键进行打印操作。</p>
              </div>
            </div>
          </div>

          {/* Document Preview Paper Canvas */}
          <div className="flex-1 bg-brand-bg p-6 overflow-y-auto flex justify-center">
            <div
              id="print-preview-content"
              className="bg-white w-[210mm] min-h-[297mm] shadow-xs border border-brand-border p-12 text-[#2D2D2A] text-left font-sans flex flex-col justify-between"
              style={{
                fontFamily: "Inter, 'Microsoft YaHei', sans-serif",
              }}
            >
              {/* Document Header */}
              <div className="space-y-4">
                <div className="border-b-[3px] border-[#4A4E3D] pb-3 text-center space-y-2">
                  <h1 className="text-xl md:text-2xl font-black text-[#4A4E3D] tracking-tight">{sheetTitle}</h1>
                  <div className="flex items-center justify-center gap-6 text-xs text-brand-secondary font-bold">
                    <span>科目：全科精选</span>
                    <span>题量：{selectedRecords.length * 4} 道试题 (含变式)</span>
                    <span>满分：100分</span>
                    <span>姓名：___________</span>
                    <span>得分：___________</span>
                  </div>
                </div>

                {/* Subtitle / notice banner */}
                <div className="p-2 border border-brand-border bg-brand-muted rounded-lg text-center text-[11px] font-bold text-[#4A4E3D]">
                  【温馨提示】本卷由“智学错题管家”智能拼卷而成。请认真作答，攻克学科易错细节。
                </div>

                {/* Questions Section */}
                <div className="mt-8 space-y-8">
                  {selectedRecords.map((rec, rIdx) => (
                    <div key={rec.id} className="space-y-6">
                      {/* Original Question */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="font-extrabold text-sm text-brand-primary bg-brand-muted px-2.5 py-0.5 rounded-full shrink-0">
                            原题 {rIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-brand-accent bg-brand-highlight/40 px-2 py-0.5 rounded-full shrink-0">
                            {rec.subject} · {rec.knowledgePoint}
                          </span>
                        </div>

                        <p className={`font-semibold text-[#2D2D2A] leading-relaxed whitespace-pre-wrap ${getFontSizeClass()}`}>
                          {rec.originalQuestion.text}
                        </p>

                        {/* Options if exist */}
                        {rec.originalQuestion.options && rec.originalQuestion.options.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-4">
                            {rec.originalQuestion.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`text-[#4A4E3D] font-medium ${getFontSizeClass()}`}>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* User Answer compare if in solution mode */}
                        {mode === "solution" && rec.originalQuestion.userAnswer && (
                          <div className="pl-4 text-xs font-bold text-brand-secondary">
                            我的原答：<span className="text-brand-accent line-through mr-4">{rec.originalQuestion.userAnswer}</span>
                            标准参考：<span className="text-brand-primary">{rec.originalQuestion.correctAnswer || "详见解析"}</span>
                          </div>
                        )}

                        {/* Answers right below the problem if inside solution mode */}
                        {mode === "solution" && (
                          <div className="ml-4 p-4 bg-brand-paper border border-brand-border/60 rounded-xl space-y-2 mt-2">
                            <p className="text-xs font-bold text-brand-primary">【原题参考答案】 {rec.originalQuestion.correctAnswer || "略"}</p>
                          </div>
                        )}
                      </div>

                      {/* Variant Questions for this record */}
                      <div className="pl-4 border-l-2 border-brand-border space-y-6 mt-4">
                        {rec.variants.map((v, vIdx) => (
                          <div key={v.id} className="space-y-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-brand-primary bg-brand-muted px-2 py-0.5 rounded-full uppercase">
                                变式题 {rIdx + 1}-{vIdx + 1}
                              </span>
                            </div>

                            <p className={`text-[#2D2D2A] font-medium leading-relaxed whitespace-pre-wrap ${getFontSizeClass()}`}>
                              {v.text}
                            </p>

                            {/* Options if exist */}
                            {v.options && v.options.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-4">
                                {v.options.map((opt, oIdx) => (
                                  <div key={oIdx} className={`text-brand-secondary ${getFontSizeClass()}`}>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Draft Line writing box */}
                            {showDraftLine && mode === "exercise" && (
                              <div className="h-20 w-full border border-dashed border-brand-border rounded-xl mt-2 flex items-end justify-center pb-2 bg-brand-paper/30">
                                <span className="text-[10px] text-brand-secondary font-sans tracking-wide">答题留白书写区 (可草稿)</span>
                              </div>
                            )}

                            {/* Solution details placed right below the problem if in solution mode */}
                            {mode === "solution" && (
                              <div className="p-4 bg-brand-highlight/25 border border-brand-highlight/40 rounded-xl space-y-2 mt-2">
                                <p className="text-xs font-extrabold text-brand-primary">
                                  【变式参考答案】 <span className="font-mono">{v.correctAnswer}</span>
                                </p>
                                <div className="text-xs text-[#4A4E3D] leading-relaxed font-sans whitespace-pre-wrap font-medium">
                                  {v.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Separation line for printable page block */}
                      {rIdx < selectedRecords.length - 1 && (
                        <div className="border-b border-dashed border-brand-border py-2" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Exercises Mode: Appendix with answers rendered on separate target printed page */}
                {mode === "exercise" && (
                  <div className="page-break mt-12 pt-8 border-t-2 border-[#4A4E3D] space-y-6">
                    <div className="text-center font-bold pb-2 border-b border-brand-border">
                      <h2 className="text-md font-extrabold text-[#4A4E3D] tracking-wide">
                        《{sheetTitle}》- 精准答案与易错精研解析
                      </h2>
                      <p className="text-[10px] text-brand-secondary mt-1">
                        【提示】请学生独立完成所有习题后再查对解析，错题切忌死记硬背。
                      </p>
                    </div>

                    <div className="space-y-6">
                      {selectedRecords.map((rec, rIdx) => (
                        <div key={rec.id} className="space-y-4 pb-4 border-b border-brand-border/40">
                          <h4 className="text-xs font-bold text-[#4A4E3D] flex items-center gap-1 bg-brand-muted p-2.5 rounded-lg">
                            <span>一、 错题组第 {rIdx + 1} 组：</span>
                            <span className="text-brand-primary">[{rec.subject}] {rec.knowledgePoint}</span>
                          </h4>

                          {/* Original answer in appendix */}
                          <div className="pl-4 space-y-1">
                            <p className="text-xs font-bold text-[#2D2D2A]">【原题参考答案】</p>
                            <p className="text-xs text-brand-secondary font-medium">{rec.originalQuestion.correctAnswer || "未设定具体标准答案。 请参照解析判定。"}</p>
                          </div>

                          {/* Variant answers in appendix */}
                          <div className="pl-4 space-y-3">
                            <p className="text-xs font-bold text-[#CB997E]">【变式精练解析】</p>
                            {rec.variants.map((v, vIdx) => (
                              <div key={v.id} className="text-xs space-y-1 border-l-2 border-brand-accent pl-2">
                                <p className="font-bold text-brand-primary">变式题 {rIdx + 1}-{vIdx + 1} 参考答案: {v.correctAnswer}</p>
                                <div className="text-brand-secondary whitespace-pre-wrap text-[11px] leading-relaxed font-semibold">
                                  {v.explanation}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Page footer */}
              <div className="pt-8 text-center text-[10px] text-brand-secondary border-t border-brand-border mt-12 flex justify-between font-mono font-bold">
                <span>智学错题管家智能打印服务试卷</span>
                <span>生成日期: {new Date().toLocaleDateString()}</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
