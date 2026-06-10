/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { QuestionDetail, WrongQuestionRecord, SUBJECT_OPTIONS } from "./types";
import SubjectBadge from "./components/SubjectBadge";
import QuestionEditor from "./components/QuestionEditor";
import VariantGeneratorView from "./components/VariantGeneratorView";
import NotebookListView from "./components/NotebookListView";
import PrintPreviewModal from "./components/PrintPreviewModal";
import {
  Upload,
  BookOpen,
  Sparkles,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
  ListRestart,
  Heart,
  Layers,
  Award,
  CheckCircle,
  BookMarked,
  Printer
} from "lucide-react";

// Tiny, valid 1x1 white pixels PNG representing a base64 photo placeholder
const PLACEHOLDER_PNG_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Beautiful, high-quality starting sample records to guide the user instantly
const INITIAL_DEMO_RECORDS: WrongQuestionRecord[] = [
  {
    id: "demo-math-1",
    subject: "数学",
    knowledgePoint: "一元二次方程根的判别式",
    savedAt: Date.now() - 3600000 * 24, // 1 day ago
    originalQuestion: {
      text: "已知关于x的一元二次方程 $x^2 - 2(k-1)x + k^2 = 0$ 有两个实数根，求k的取值范围。",
      userAnswer: "k >= 1/2",
      correctAnswer: "k <= 1/2",
    },
    variants: [
      {
        id: "demo-math-v1",
        text: "设计关于y的一元二次方程 $2y^2 - 4ky + (k^2 - 1) = 0$ 有两个不相等的虚根，求满足条件的常数k的取值范围。",
        correctAnswer: "k^2 < -1 (无实数k，即k值不存在)",
        explanation: "由于要求有两个不相等的虚根，则判别式 $\\Delta = 16k^2 - 8(k^2 - 1) = 8k^2 + 8 < 0$。\n解得 $k^2 < -1$，在实数范围内无解。\n【易错点剖析】此题极易因概念混淆，习惯性地认为有实数解而列式 $\\Delta \\geq 0$，而忽略虚根对应的 $\\Delta < 0$ 的判别方向，且忘记核对实常数k的二次幂是非负数（$k^2 \\geq 0$）的性质。"
      },
      {
        id: "demo-math-v2",
        text: "已知关于x的方程式 $(m-1)x^2 - 2mx + m + 3 = 0$ 有实数根，求m的取值范围关系式。",
        correctAnswer: "m <= 3 且 m != 1",
        explanation: "当 $m-1 \\neq 0$，即 $m \\neq 1$ 时，方程为一元二次方程。有实数根说明分量判别式 $\\Delta = 4m^2 - 4(m-1)(m+3) \\geq 0$，解得 $m \\leq 3$。当 $m=1$ 时原方程为 $-2x + 4 = 0$，有一次项实根，故也合理。但二者情况判别要绝对清晰。\n【易错点剖析】学生极易漏讨论二次项系数 $m-1$ 等于0的边界条件，直接默认其为二次方程计算 $\\Delta$，从而在综合答案中遗漏或错列包含关系。"
      },
      {
        id: "demo-math-v3",
        text: "若方程 $x^2 + px + q = 0$ 的两根之差绝对值为3，试用p表示阻尼常量q的极值代数式。",
        correctAnswer: "q = (p^2 - 9) / 4",
        explanation: "由韦达定理 $x_1+x_2 = -p$，$x_1 x_2 = q$。两根差绝对值 $|x_1 - x_2| = \\sqrt{(x_1+x_2)^2 - 4x_1 x_2} = \\sqrt{p^2 - 4q} = 3$，由此平方化简得 $p^2 - 4q = 9$，移项可得 $q = (p^2 - 9)/4$。\n【易错点剖析】多人在差值平方展开时容易丢项，写成 $(x_1-x_2)^2=(x_1+x_2)^2-2x_1x_2$ 导致常数因子少扣2倍的韦达项积，属于公式变形经典马虎错误。"
      }
    ]
  },
  {
    id: "demo-english-2",
    subject: "英语",
    knowledgePoint: "现在完成时态",
    savedAt: Date.now() - 3600000 * 2, // 2 hours ago
    originalQuestion: {
      text: "How long _____ you _____ (live) in this beautiful city? - For ten years.",
      userAnswer: "How long is you lived",
      correctAnswer: "How long have you lived",
    },
    variants: [
      {
        id: "demo-eng-v1",
        text: "I _____ already _____ (see) that film twice. Please change to another one.",
        correctAnswer: "have, seen",
        explanation: "现在完成时表示过去发生的动作对现在造成的影响。句中有 already 及 twice 标志词，表明已经看过。I 对应助动词 have，see的过去分词为 seen。\n【易错点剖析】极易将 have 忘写，或者错误将 seem / saw 错写为过去分词，忘记 remember 规则与不规则过去分词的字母排序变化规律。"
      },
      {
        id: "demo-eng-v2",
        text: "Mr. Green _____ (go) to Beijing. He will be back next Monday. (用适当的时态填空)",
        correctAnswer: "has gone",
        explanation: "go 对应的现在完成时有 has/have gone to (去了未归) 与 has/have been to (去过已归) 的区别。由于他说 '下周一回来'，说明人还在北京，并未在本地，故使用 has gone。\n【易错点剖析】很多学生对 'has been to' (去过) 和 'has gone to' (去了，未回) 分辨不清，导致在情景阅读和语境单选题中判断失误。"
      },
      {
        id: "demo-eng-v3",
        text: "Since we last met in 2024, our school _____ (experience) great improvements.",
        correctAnswer: "has experienced",
        explanation: "由 ‘since + 过去具体时间点’ 引导的时间状语从句时，主句关联动作多半从过去持续影响到现在，应匹配标准现在完成时，our school 属于第三人称单数，故用 has experienced。\n【易错点剖析】中学生常误看到 since 从句中的 2024 而选择一般过去时 experienced，忽视了 since (自从...以来) 对主句时态的现在完成时限制机制。"
      }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"ocr" | "notebook">("ocr");
  const [records, setRecords] = useState<WrongQuestionRecord[]>([]);

  // Scanning Phase States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [editorStep, setEditorStep] = useState<"upload" | "edit" | "generate">("upload");

  // OCR Recognition Results
  const [subject, setSubject] = useState("数学");
  const [knowledgePoint, setKnowledgePoint] = useState("");
  const [question, setQuestion] = useState<QuestionDetail>({
    text: "",
    options: [],
    userAnswer: "",
    correctAnswer: "",
  });

  // Selected records for Print modal
  const [selectedRecordsToPrint, setSelectedRecordsToPrint] = useState<WrongQuestionRecord[] | null>(null);

  // Initialize notebooks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("WRITING_PRINT_RECORD");
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        // Pre-seed demo entries
        localStorage.setItem("WRITING_PRINT_RECORD", JSON.stringify(INITIAL_DEMO_RECORDS));
        setRecords(INITIAL_DEMO_RECORDS);
      }
    } catch (e) {
      console.error("Local storage initializing error", e);
    }
  }, []);

  const saveToLocalStorage = (updated: WrongQuestionRecord[]) => {
    try {
      localStorage.setItem("WRITING_PRINT_RECORD", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to commit back to localStorage", e);
    }
  };

  // Image File Upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  // Preset demonstration loader to make test runs super easy to trigger
  const handleLoadDemoImage = (type: "math" | "english" | "physics") => {
    setSelectedImage(PLACEHOLDER_PNG_BASE64);
    setScanError(null);

    // Let's populate mock question detail corresponding to choice
    if (type === "math") {
      setSubject("数学");
      setKnowledgePoint("一元二次方程根的判别式");
      setQuestion({
        text: "已知关于x的一元二次方程 $x^2 - 2(k-1)x + k^2 = 0$ 有两个实数根，求k的取值范围。",
        options: [],
        userAnswer: "k >= 1/2",
        correctAnswer: "k <= 1/2",
      });
    } else if (type === "english") {
      setSubject("英语");
      setKnowledgePoint("现在完成时态");
      setQuestion({
        text: "How long _____ you _____ (live) in this beautiful city? - For ten years.",
        options: ["A. did / live", "B. do / live", "C. are / living", "D. have / lived"],
        userAnswer: "C",
        correctAnswer: "D",
      });
    } else {
      setSubject("物理");
      setKnowledgePoint("电学欧姆定律");
      setQuestion({
        text: "在如图所示的电路中，电源电压为6V且保持不变。当滑动变阻器的滑片P向右移动时，电流表的示数和电压表的示数将如何变化？",
        options: ["A. 电流表示数变大，电压表示数变小", "B. 电流表示数变小，电压表示数变大", "C. 电流表示数变小，电压表示数变小", "D. 电流表示数变大，电压表示数变大"],
        userAnswer: "A",
        correctAnswer: "B",
      });
    }

    // Set view forward to edit instantly!
    setEditorStep("edit");
  };

  // Run Real OCR API call
  const handleStartOCR = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "识别网络接口故障。");
      }

      const ocrResult = data.data;
      setSubject(ocrResult.subject || "数学");
      setKnowledgePoint(ocrResult.knowledgePoint || "");
      setQuestion({
        text: ocrResult.text || "",
        options: ocrResult.options || [],
        userAnswer: ocrResult.userAnswer || "",
        correctAnswer: ocrResult.correctAnswer || "",
      });

      setEditorStep("edit");
    } catch (err: any) {
      setScanError(err.message || "OCR识别服务接口发生错误，若需要测试你可以点击下方『免拍摄快速体验』进行智能模拟。");
    } finally {
      setIsScanning(false);
    }
  };

  // Save full record from variant generator
  const handleSaveRecord = (newRecord: Omit<WrongQuestionRecord, "id" | "savedAt">) => {
    const freshRecord: WrongQuestionRecord = {
      ...newRecord,
      id: `record-${Date.now()}`,
      savedAt: Date.now(),
    };

    const updated = [freshRecord, ...records];
    setRecords(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveToLocalStorage(updated);
  };

  const handleResetApp = () => {
    setSelectedImage(null);
    setScanError(null);
    setEditorStep("upload");
    setQuestion({ text: "", options: [], userAnswer: "", correctAnswer: "" });
    setKnowledgePoint("");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between text-brand-text antialiased font-sans transition-colors duration-300">
      
      {/* Dynamic Nav Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-brand-border z-30 no-print">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-xs">
              <Printer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#4A4E3D] tracking-tight flex items-center gap-1">
                全科错题举一反三打印机
                <span className="text-[10px] bg-brand-muted text-brand-primary px-1.5 py-0.5 rounded-md font-sans border border-brand-primary/20">v1.2</span>
              </h1>
              <p className="text-[10px] text-brand-secondary font-medium">拍照提取错题 · 智能生成变式考纲同步训练 · PDF打印复印</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-brand-primary bg-brand-muted border border-brand-primary/20 px-3 py-1.5 rounded-lg font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
              <span>智能引擎在线</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main body viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8">
        
        {/* Tab 1: OCR and Variant Generator */}
        {activeTab === "ocr" && (
          <div className="space-y-6">
            
            {/* Step 1: Upload and Image scanning */}
            {editorStep === "upload" && (
              <div className="space-y-6">
                
                {/* Hero Intro banner */}
                <div className="bg-brand-highlight/40 rounded-3xl p-6 md:p-8 text-[#2D2D2A] border border-brand-border shadow-xs space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10 scale-150">
                    <Sparkles className="w-64 h-64 text-brand-primary" />
                  </div>
                  
                  <div className="inline-flex items-center gap-1.5 bg-white border border-brand-border/40 px-2.5 py-1 rounded-full text-xs font-bold text-brand-primary">
                    <Award className="w-3.5 h-3.5" /> AIGC 提分助考精细化定制
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight font-sans text-brand-primary">错题一键扫，考点举一反三！</h2>
                  <p className="text-xs md:text-sm text-[#4A4E3D] leading-relaxed font-sans font-medium max-w-2xl">
                    教辅或考卷中做错的题，直接拍照或裁剪上传。大模型将极速OCR定位并智能提取考纲知识网，为您贴心衍生3道不同考核层面的相似拓展题，直击思维误区与丢分陷阱。
                  </p>
                </div>

                {/* Primary Upload card */}
                <div className="bg-white rounded-[24px] border border-brand-border p-6 md:p-8 space-y-6 shadow-xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Drag and drop upload zone */}
                    <div className="border-2 border-dashed border-brand-border/80 hover:border-brand-primary rounded-[20px] p-6 flex flex-col items-center justify-center text-center space-y-4 bg-brand-muted/30 hover:bg-brand-muted/50 transition-all cursor-pointer relative min-h-[220px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="点击或拖拽上传图片"
                      />
                      <div className="w-12 h-12 bg-white text-brand-primary border border-brand-border rounded-full flex items-center justify-center shadow-xs">
                        <Camera className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div className="space-y-1 max-w-xs">
                        <p className="text-sm font-bold text-[#4A4E3D]">拍照 或 选择相册图片</p>
                        <p className="text-xs text-brand-secondary font-medium">支持拖入照片文件，需能看清题目文字</p>
                      </div>
                      <button className="px-4 py-1.5 bg-brand-muted hover:bg-brand-paper border border-brand-primary/25 text-brand-primary font-bold rounded-lg text-xs transition-all pointer-events-none">
                        浏览系统目录
                      </button>
                    </div>

                    {/* Quick Previews & Instruction options */}
                    <div className="flex flex-col justify-between space-y-4">
                      
                      <div className="p-4 bg-brand-highlight/25 border-l-4 border-brand-accent rounded-r-xl space-y-1">
                        <h4 className="text-xs font-bold text-[#4A4E3D] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-brand-accent" /> OCR 注意说明及技术支撑
                        </h4>
                        <p className="text-[11px] text-[#4A4E3D] leading-normal font-sans font-medium">
                          支持识别：初高中全学科错题。包含基础中文、英语短句阅写、数学根号分数代数公式等。<br />
                          若扫描质量不佳导致识别偏差，您可以在下一阶段手动修改任意段落。
                        </p>
                      </div>

                      {/* DEMO Playground Bypassing (EXTREME USER EXPERIENCE) */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-brand-secondary">🏁 没带课本？点击下方免拍摄极速体验一键测试：</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadDemoImage("math")}
                            className="p-2 border border-brand-border/60 rounded-xl text-center bg-white hover:bg-brand-muted transition-all cursor-pointer transform active:scale-95 space-y-1"
                          >
                            <span className="text-[11px] font-bold text-brand-primary block">高一数学</span>
                            <span className="text-[9px] text-brand-secondary font-medium block truncate">判别式求k范围</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadDemoImage("english")}
                            className="p-2 border border-brand-border/60 rounded-xl text-center bg-white hover:bg-brand-muted transition-all cursor-pointer transform active:scale-95 space-y-1"
                          >
                            <span className="text-[11px] font-bold text-brand-accent block">初中英语</span>
                            <span className="text-[9px] text-brand-secondary font-medium block truncate">现在完成时填空</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLoadDemoImage("physics")}
                            className="p-2 border border-brand-border/60 rounded-xl text-center bg-white hover:bg-brand-muted transition-all cursor-pointer transform active:scale-95 space-y-1"
                          >
                            <span className="text-[11px] font-bold text-[#7A8A61] block">高中物理</span>
                            <span className="text-[9px] text-brand-secondary font-medium block truncate">欧姆定律考题</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Selected image display and ocr submission */}
                  {selectedImage && (
                    <div className="border border-brand-border rounded-[20px] p-4 bg-brand-muted flex flex-col md:flex-row items-center gap-4 animate-fade-in">
                      <div className="w-24 h-24 bg-white rounded-xl overflow-hidden border border-brand-border flex items-center justify-center shrink-0">
                        <img
                          src={selectedImage}
                          alt="已选错题"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-1">
                        <p className="text-xs font-bold text-[#4A4E3D]">已就绪待提取的图形文件</p>
                        <p className="text-[10px] text-brand-secondary font-medium truncate">大小符合扫描规范，可直接进行大模型OCR解析</p>
                      </div>
                      <button
                        onClick={handleStartOCR}
                        disabled={isScanning}
                        className="w-full md:w-auto px-5 h-10 bg-brand-primary text-white font-bold rounded-xl text-xs shadow-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 shrink-0"
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>OCR 智能识别中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>开始 OCR 识别错题</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {isScanning && (
                    <div className="p-4 bg-brand-highlight/20 border border-brand-highlight/50 rounded-xl flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                      <p className="text-xs text-[#4A4E3D] font-bold">大模型正在对您的错题照片进行多学科OCR双通道扫描提取，约需 5 秒，请耐心稍候...</p>
                    </div>
                  )}

                  {scanError && (
                    <div className="p-4 bg-[#FDF6F0] border border-[#ECD9C5] rounded-xl space-y-2">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-brand-accent font-bold">扫描识别失败提示：</p>
                          <p className="text-[11px] text-[#4A4E3D] leading-normal font-semibold">{scanError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Step 2: Confirm & Edit question info */}
            {editorStep === "edit" && (
              <QuestionEditor
                subject={subject}
                setSubject={setSubject}
                knowledgePoint={knowledgePoint}
                setKnowledgePoint={setKnowledgePoint}
                question={question}
                setQuestion={setQuestion}
                onConfirm={() => setEditorStep("generate")}
              />
            )}

            {/* Step 3: Variant Generator & Solution highlighters */}
            {editorStep === "generate" && (
              <VariantGeneratorView
                subject={subject}
                knowledgePoint={knowledgePoint}
                originalQuestion={question}
                originalImage={selectedImage || undefined}
                onSaveRecord={handleSaveRecord}
                onReset={handleResetApp}
              />
            )}

          </div>
        )}

        {/* Tab 2: Wrong Questions List & filter database / Multi print sheets */}
        {activeTab === "notebook" && (
          <NotebookListView
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onPrintSelected={(selected) => setSelectedRecordsToPrint(selected)}
          />
        )}

      </main>

      {/* Elegant printable modal */}
      {selectedRecordsToPrint && (
        <PrintPreviewModal
          selectedRecords={selectedRecordsToPrint}
          onClose={() => setSelectedRecordsToPrint(null)}
        />
      )}

      {/* Floating Bottom Nav bar for mobile and centered tab switching */}
      <div className="sticky bottom-0 bg-white border-t border-brand-border px-4 py-2.5 z-30 no-print flex justify-center shadow-xs">
        <div className="max-w-md w-full bg-brand-muted p-1.5 rounded-[20px] grid grid-cols-2 gap-2 border border-brand-border/40">
          
          <button
            onClick={() => {
              setActiveTab("ocr");
            }}
            className={`py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "ocr"
                ? "bg-white text-brand-primary shadow-xs border border-brand-border/40 font-sans"
                : "text-brand-secondary hover:text-brand-primary font-sans"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>智能错题识别</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("notebook");
              setSelectedRecordsToPrint(null);
            }}
            className={`py-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "notebook"
                ? "bg-white text-brand-primary shadow-xs border border-brand-border/40 font-sans"
                : "text-brand-secondary hover:text-brand-primary font-sans"
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>全科错题本 ({records.length})</span>
          </button>

        </div>
      </div>

    </div>
  );
}
