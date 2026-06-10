/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WrongQuestionRecord, SUBJECT_OPTIONS } from "../types";
import { Search, Filter, Calendar, BookOpen, Trash2, CheckSquare, Square, Printer, ChevronDown, ChevronUp, Image } from "lucide-react";
import SubjectBadge from "./SubjectBadge";

interface NotebookListViewProps {
  records: WrongQuestionRecord[];
  onDeleteRecord: (id: string) => void;
  onPrintSelected: (selected: WrongQuestionRecord[]) => void;
}

export default function NotebookListView({
  records,
  onDeleteRecord,
  onPrintSelected,
}: NotebookListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("全部");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Sorting: newest first
  const sortedRecords = [...records].sort((a, b) => b.savedAt - a.savedAt);

  // Filtering
  const filteredRecords = sortedRecords.filter((rec) => {
    const matchesSearch =
      rec.knowledgePoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.originalQuestion.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "全部" || rec.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      // Clear
      setSelectedIds([]);
    } else {
      // Select all visible filtered elements
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  const handlePrint = () => {
    const selected = records.filter((rec) => selectedIds.includes(rec.id));
    if (selected.length === 0) return;
    onPrintSelected(selected);
  };

  // Render easy-pitfalls parser
  const renderClassifiedExplanation = (explanation: string) => {
    const kw = "【易错点剖析】";
    if (explanation.includes(kw)) {
      const parts = explanation.split(kw);
      return (
        <div className="space-y-2 mt-1">
          <p className="text-xs text-[#2D2D2A] leading-relaxed font-sans">{parts[0]}</p>
          <div className="p-3 bg-brand-highlight/40 border-l-3 border-brand-accent rounded-r-lg">
            <span className="text-[10px] font-bold text-brand-accent block mb-0.5">⚠️ 易错剖析：</span>
            <p className="text-[#4A4E3D] text-xs leading-relaxed font-sans font-semibold">{parts[1]}</p>
          </div>
        </div>
      );
    }
    return <p className="text-xs text-[#2D2D2A] leading-relaxed mt-1 font-sans">{explanation}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header card */}
      <div className="bg-white rounded-[24px] border border-brand-border p-5 space-y-4 shadow-none">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索题目关键字、考题内容、核心学法知识点..."
              className="w-full h-10 pl-10 pr-4 bg-brand-paper border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-brand-secondary"
            />
          </div>

          {/* Subject Selective Filter */}
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-brand-secondary" />
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedIds([]); // reset selection to avoid confusion when filtered out
              }}
              className="w-full h-10 pl-9 pr-4 bg-brand-paper border border-brand-border rounded-xl text-xs font-semibold text-[#4A4E3D] focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all cursor-pointer"
            >
              <option value="全部">全部学科</option>
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-operations control panel */}
        {filteredRecords.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-border">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-[#4A4E3D] hover:text-brand-primary transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-brand-muted"
              >
                {selectedIds.length === filteredRecords.length ? (
                  <CheckSquare className="w-4 h-4 text-brand-primary" />
                ) : (
                  <Square className="w-4 h-4 text-brand-secondary" />
                )}
                <span>
                  {selectedIds.length === filteredRecords.length ? "取消全选" : "选择全部"}
                </span>
              </button>
              {selectedIds.length > 0 && (
                <span className="text-xs text-brand-secondary font-medium">
                  已选择 <strong className="text-brand-primary">{selectedIds.length}</strong> 组错题
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={selectedIds.length === 0}
                className={`h-10 px-5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  selectedIds.length > 0
                    ? "bg-brand-primary text-white hover:opacity-95 cursor-pointer transform active:scale-95"
                    : "bg-brand-muted text-brand-secondary cursor-not-allowed border border-brand-border/40"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>批量生成 PDF 打印 ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List Layout */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-brand-border p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-brand-muted rounded-full flex items-center justify-center mx-auto text-brand-secondary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h4 className="text-sm font-bold text-[#4A4E3D]">没有查到符合条件的错题</h4>
            <p className="text-xs text-brand-secondary font-medium">
              {records.length === 0 ? "错题本目前空空如也，请先上传照片去识别添加错题！" : "试试更换筛选条件或重组搜索关键词。"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => {
            const isSelected = selectedIds.includes(rec.id);
            const isExpanded = expandedRecordId === rec.id;

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-[24px] border transition-all overflow-hidden shadow-none ${
                  isSelected ? "border-brand-accent ring-2 ring-brand-accent/10" : "border-brand-border"
                }`}
              >
                {/* Main Card Header element */}
                <div className="p-5 flex items-start gap-4 cursor-pointer hover:bg-brand-paper transition-all">
                  {/* Select Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(rec.id);
                    }}
                    className="p-1 text-brand-secondary hover:text-brand-primary hover:bg-brand-muted rounded-lg transition-all"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-brand-accent" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  {/* Info body */}
                  <div className="flex-1 min-w-0 space-y-2.5" onClick={() => toggleExpand(rec.id)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <SubjectBadge subject={rec.subject} />
                      <span className="text-xs font-bold text-[#4A4E3D] bg-brand-muted px-2.5 py-1 rounded-full max-w-[200px] truncate">
                        {rec.knowledgePoint}
                      </span>
                      <span className="text-[10px] text-brand-secondary flex items-center gap-1 ml-auto font-bold">
                        <Calendar className="w-3 h-3" />
                        {new Date(rec.savedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[#2D2D2A] text-sm font-bold line-clamp-2 leading-relaxed">
                      {rec.originalQuestion.text}
                    </p>

                    {/* Metadata line */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-brand-secondary">
                      <span>包含：1 道原题 + 3 道举一反三精练题</span>
                      {rec.originalImage && (
                        <span className="flex items-center gap-1 text-[#CB997E]">
                          <Image className="w-3.5 h-3.5 text-brand-accent" /> 有原图
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("确定要删除这条错题记录吗？删除后不可恢复。")) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-2 text-brand-secondary hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="删除记录"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpand(rec.id)}
                      className="p-1.5 bg-brand-muted border border-brand-border rounded-lg text-brand-primary hover:bg-brand-paper transition-all"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded content overview */}
                {isExpanded && (
                  <div className="bg-brand-paper border-t border-brand-border/40 p-6 space-y-6">
                    {/* ORIGINAL PROBLEM SHOWN */}
                    <div className="p-4 bg-white rounded-xl border border-dashed border-brand-border space-y-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-primary bg-brand-muted px-2.5 py-1 rounded-full">
                          【错题原题回顾】
                        </span>
                      </div>

                      {/* Optional original image rendering */}
                      {rec.originalImage && (
                        <div className="max-w-md bg-brand-paper rounded-lg overflow-hidden border border-brand-border">
                          <img
                            src={rec.originalImage}
                            alt="原始拍照记录"
                            referrerPolicy="no-referrer"
                            className="w-full max-h-48 object-contain"
                          />
                        </div>
                      )}

                      <p className="text-[#2D2D2A] text-sm leading-relaxed font-bold">
                        {rec.originalQuestion.text}
                      </p>

                      {rec.originalQuestion.options && rec.originalQuestion.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                          {rec.originalQuestion.options.map((opt, oIdx) => (
                            <div key={oIdx} className="text-xs text-[#4A4E3D] font-medium">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-brand-border/40 font-medium">
                        {rec.originalQuestion.userAnswer && (
                          <div className="text-brand-secondary">
                            学生当初原答：<span className="text-brand-accent font-bold">{rec.originalQuestion.userAnswer}</span>
                          </div>
                        )}
                        {rec.originalQuestion.correctAnswer && (
                          <div className="text-brand-secondary">
                            标准参考答案：<span className="text-brand-primary font-bold">{rec.originalQuestion.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VARIANT PROBLEMS LIST */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-brand-primary flex items-center gap-1 uppercase tracking-tight pl-1.5 border-l-2 border-brand-primary">
                        本次生成的 3 道举一反三特训试题
                      </h5>

                      <div className="grid grid-cols-1 gap-4">
                        {rec.variants.map((v, idx) => (
                          <div key={v.id} className="bg-white p-5 rounded-2xl border border-brand-border/60 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-brand-primary bg-brand-muted px-2 py-0.5 rounded-full">
                                变式试题 {idx + 1}
                              </span>
                            </div>

                            <p className="text-[#2D2D2A] text-xs font-bold leading-relaxed font-sans">
                              {v.text}
                            </p>

                            {v.options && v.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                {v.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="p-2 bg-brand-paper border border-brand-border/40 rounded-lg text-[10px] text-[#4A4E3D] font-sans"
                                  >
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-brand-paper p-3 rounded-lg text-xs space-y-2 border border-dotted border-brand-border">
                              <p className="text-brand-primary font-bold">
                                正确答案：<span className="font-mono text-sm leading-none font-black text-brand-primary">{v.correctAnswer}</span>
                              </p>
                              <div>
                                <span className="text-[10px] font-bold text-brand-secondary block mb-1">【名师剖析解析】</span>
                                {renderClassifiedExplanation(v.explanation)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

