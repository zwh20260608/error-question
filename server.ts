/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "" || apiKey.includes("YOUR")) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export const app = express();
const PORT = 3000;

// Increase payload limit to support base64 images uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // API router
  app.post("/api/ocr", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image data." });
      }

      // Check if image is standard base64 data URL
      let base64Data = image;
      let mimeType = "image/png";

      const dataUrlRegex = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/;
      const match = image.match(dataUrlRegex);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      const client = getGeminiClient();
      if (!client) {
        // Return simulated high-fidelity OCR data for easy testing
        const sampleOcr = {
          text: "已知关于x的一元二次方程 $x^2 - 2(k-1)x + k^2 = 0$ 有两个实数根，求k的取值范围。",
          options: [],
          userAnswer: "k >= 1/2",
          correctAnswer: "k <= 1/2",
          subject: "数学",
          knowledgePoint: "一元二次方程根的判别式"
        };
        return res.json({ success: true, data: sampleOcr, isSimulated: true, warning: "GEMINI_API_KEY was not configured. Application is running in high-fidelity simulation fallback mode." });
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const promptPart = {
        text: `You are an expert multi-disciplinary school teacher who is excellent at OCR and solving problems.
Please analyze the image containing a homework, test, or textbook question.
Perform OCR to extract details from it.
Respond STRCITLY in JSON format following the schema.

Guidelines:
1. "text": Extract the question text fully, including any math expressions (use readable formats or inline LaTeX if applicable like $a^2+b^2=c^2$).
2. "options": If the question is a multiple choice, populate this array with strings (e.g. ["A. ...", "B. ..."]). If not multiple choice, return an empty array.
3. "userAnswer": If you spot any handwritten answer, checkbox checked, or scribbled answer nearby that indicates a student's response, extract it. Otherwise, return null or an empty string.
4. "correctAnswer": The standard correct answer. Solve the problem accurately.
5. "subject": Detect the subject of this problem. It MUST be EXACTLY one of: "数学", "英语", "语文", "物理", "化学", "生物", "历史", "地理", "政治", "其他".
6. "knowledgePoint": Identify the core syllabus knowledge point (e.g., "一元二次方程根的判别式", "时态一现在完成时", "欧姆定律"). Be concise but descriptive.`,
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, promptPart],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Full extracted OCR text of the problem." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of options if it is a multiple choice problem."
              },
              userAnswer: { type: Type.STRING, description: "Student's written/checked/marked answer if spotted. Else empty." },
              correctAnswer: { type: Type.STRING, description: "Correct solution or answer to the problem." },
              subject: { type: Type.STRING, description: "Exactly one of: 数学, 英语, 语文, 物理, 化学, 生物, 历史, 地理, 政治, 其他" },
              knowledgePoint: { type: Type.STRING, description: "Core knowledge point, e.g. 一元二次方程根的判别式." }
            },
            required: ["text", "options", "userAnswer", "correctAnswer", "subject", "knowledgePoint"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini.");
      }

      const result = JSON.parse(responseText.trim());
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("OCR API error:", error);
      res.status(500).json({ error: error.message || "Failed to process image OCR." });
    }
  });

  app.post("/api/generate-variants", async (req, res) => {
    try {
      const { text, options, correctAnswer, knowledgePoint, subject } = req.body;
      if (!text || !knowledgePoint) {
        return res.status(400).json({ error: "Missing required query params (text/knowledgePoint)." });
      }

      const client = getGeminiClient();
      if (!client) {
        const kp = knowledgePoint || "未知知识点";
        const subj = subject || "数学";
        
        let simulatedVariants: any[] = [];
        
        if (subj === "数学" || kp.includes("方程") || kp.includes("判别式")) {
          simulatedVariants = [
            {
              text: "【强化特训题】设关于x的一元二次方程 $x^2 + 2mx + m^2 - 2m + 3 = 0$ 有两个不相等的实数根，求参变量m的取值范围。",
              options: [],
              correctAnswer: "m > 1.5",
              explanation: "【解析】根据一元二次方程根的定义，方程有两个不相等的实数根，说明根的判别式严格满足 $\\Delta > 0$。\n列出不等式：$\\Delta = (2m)^2 - 4(1)(m^2 - 2m + 3) = 4m^2 - 4m^2 + 8m - 12 = 8m - 12 > 0$。\n解得参数范围 $m > 1.5$。\n【易错点剖析】解本题时极易犯两个思维错误：① 错写判别式为 $\\Delta \\geq 0$，未紧扣“不相等”的概念；② 在复杂的带括号的多项式展开口算中错漏正负号，从而求错分界点。"
            },
            {
              text: "【常考陷阱题】已知关于x的代数方程 $ax^2 - 4x + 2 = 0$ 有实数根，求系数a的取值范围。",
              options: [],
              correctAnswer: "a <= 2 且 a != 0",
              explanation: "【解析】这是一道经典陷阱题。当该方程是一元二次方程（即 $a \\neq 0$）时，方程有实数根表示其判别式满足 $\\Delta = (-4)^2 - 4(a)(2) = 16 - 8a \\geq 0$，解得 $a \\leq 2$。\n必须结合二次项系数不为零的隐性定义条件，所以此时 $a \\leq 2$ 且 $a \\neq 0$。\n【易错点剖析】此题是中高考高频易错点！学生极易漏掉隐性限制条件 $a \\neq 0$，从而在答题纸上直接漏掉判定，导致考题严重扣分。"
            },
            {
              text: "【能力提升题】是否存在实数k，使得关于x的方程 $(k-1)x^2 + 2x + 1 = 0$ 至少有一个实根？若存在，求其最大整数值。",
              options: [],
              correctAnswer: "k = 2",
              explanation: "【解析】根据方程拥有实根的定义，我们必须全面考虑方程的次数类型：\n1) 当 $k-1 = 0$ 即 $k=1$ 时，原方程化为一次方程 $2x + 1 = 0$，其解为 $x = -0.5$，有一实根，符合题意；\n2) 当 $k-1 \\neq 0$ 时，方程为一元二次方程，要保证有实根，其判别式必满足 $\\Delta = 2^2 - 4(k-1)(1) = 8 - 4k \\geq 0$，解得 $k \\leq 2$ 且 $k \\neq 1$。\n综上，k的取值范围合并为 $k \\leq 2$。其最大整数值即为 $2$。\n【易错点剖析】大量同学在审题时未见“方程”并无指定“二次”声明，直接套入判别式计算而忽略了二次项系数为0的特殊一次方程情况，丧失思考的多重维度。"
            }
          ];
        } else if (subj === "英语" || kp.includes("时态") || kp.includes("have")) {
          simulatedVariants = [
            {
              text: "Mr. Reed _____ in Beijing for five years, but now he is working in Shanghai.",
              options: ["A. has lived", "B. lived", "C. is living", "D. lives"],
              correctAnswer: "B",
              explanation: "【解析】本题考察一般过去时与现在完成时的辨析。虽然有 for five years 这类表示持续时间的介词短语，但后面句明确指出“现在他在上海工作”（now he is working in Shanghai），说明“在北京住五年”完全是过去发生且已经结束的动作，与现在不发生联系。因此应使用一般过去时 lived。\n【易错点剖析】学生极易形成思维定式，只要看见 for/since 引导的持续时间就毫不犹豫选择现在完成时 has lived，从而陷入题目中预设的时态语法陷阱。"
            },
            {
              text: "I _____ the novel three times. I think it is worth reading again.",
              options: ["A. read", "B. was reading", "C. have read", "D. had read"],
              correctAnswer: "C",
              explanation: "【解析】根据 three times（三次）可知，此处表示过去经历过数次的动作对当前产生的影响和感悟（打算再读一遍），属于典型的现在完成时用法。主语为 I，应搭配 have read。\n【易错点剖析】部分 student 由于未仔细分析 have read 中动词 read 的过去分词拼写与原型一致（都拼作 read），误将 A 选项当作正确答案，且疏于理解动作对当下的实际心理投射表达。"
            },
            {
              text: "Great changes _____ taken place in my hometown since the reform and opening up program started.",
              options: ["A. have", "B. had", "C. has", "D. are"],
              correctAnswer: "A",
              explanation: "【解析】本处考查主谓一致与时态的结合。句中带有 since 引导的时间状语从句，主句时态应该用现在完成时（have/has + 过去分词）。主语为 changes（复数名词），应当选择复数助动词 have。\n【易错点剖析】考生经常分不清 take place（发生）的无被动语态特质（容易误选 are taken place 进行被动句构架），或是在 has 与 have 之间混淆单复数主谓匹配关系。"
            }
          ];
        } else if (subj === "物理" || kp.includes("电阻") || kp.includes("欧姆") || kp.includes("电流")) {
          simulatedVariants = [
            {
              text: "在如图所示的伏安法测电阻电路中，若将电压表和电流表的位置互换，则闭合开关后可能会产生的后果是：",
              options: ["A. 两个电表都会被彻底烧毁", "B. 电压表示数接近电源电压，电流表示数几乎为零", "C. 电流表示数极大，电压表示数几乎为零", "D. 无任何异常，电表依旧可以正常读数"],
              correctAnswer: "B",
              explanation: "【解析】电压表具有极其庞大的内阻，而电流表的内阻微乎其微。若位置互换，电压表将被串联接入干路，由于其内阻巨大，整个电路的电流接近于零，所以电流表示数几乎为零。而电压表相当于直接跨接在电源两端，分得绝大多数电压，示数接近电源电压。\n【易错点剖析】学生常常凭着粗浅的刻板印象选择 A 选项，误以为只要将表接错就会导致“烧表毁灭”，缺乏对电阻分压模型和仪表等效电路的量化解析。"
            },
            {
              text: "有关导体电阻的定义式 $R = U/I$，下列说法中科学、正确的是：",
              options: ["A. 导体的电阻与导体两端的电压成正比", "B. 导体的电阻与根据欧姆定律得出的电流成反比", "C. 导体两端的电压为零时，导体的电阻必然也为零", "D. 导体的电阻是导体本身的属性，其阻值不随电压和电流的改变而改变"],
              correctAnswer: "D",
              explanation: "【解析】电阻是导体本身的一种固有电学属性。它的阻值大小主要由导体的长度、横截面积、材料以及工作温度所决定，不随外加电压 $U$ 或通过电流 $I$ 的变化而变化。$R = U/I$ 仅仅是欧姆定律推导出来的量度计算公式，并非因果决定性质的物理规律。\n【易错点剖析】学生极易习惯于数学函数思维（如 $y=k/x$ 正反比关系），单纯根据公式形式而片面联想出“电压大电阻大、电流大电阻小”等完全颠倒物理本源特性的错误结论。"
            },
            {
              text: "两根由同种材料制成的合金导线 A 和 B，已知 A 导线的长度是 B 的 2 倍，而 B 的横截面积是 A 的 3 倍，则这两根导线的电阻比值 $R_A : R_B$ 为：",
              options: ["A. 2 : 3", "B. 3 : 2", "C. 6 : 1", "D. 1 : 6"],
              correctAnswer: "C",
              explanation: "【解析】根据导体电阻决定定律 $R = \\rho \\frac{L}{S}$，同种材料则电阻率 $\\rho$ 相同；\n已知 $L_A = 2 L_B$， $S_B = 3 S_A$；\n带入得：$\\frac{R_A}{R_B} = \\frac{L_A / S_A}{L_B / S_B} = \\frac{2 L_B / S_A}{L_B / (3 S_A)} = 2 \\times 3 = 6$。即 $R_A : R_B = 6 : 1$。\n【易错点剖析】部分学生比例换算不扎实，极易把分子分母的倍数除反，错写为 2:3 或者 1:6，或者由于不熟悉公式的函数正反比变量依赖而计算错误。"
            }
          ];
        } else {
          simulatedVariants = [
            {
              text: `【强化特训·变式一】围绕知识点【${kp}】进行针对性练习：在全新情境下，如何判定该考点的适用范围与主要边界？请试做类似题目。`,
              options: ["A. 选择该考点经典的核心范围", "B. 扩大概念外延，涵盖周边变式", "C. 缩小应用边界，排除冗余干扰", "D. 结合具体学科背景做出全面合规研判"],
              correctAnswer: "D",
              explanation: `【解析】本题主要针对《${kp}》的核心认知开展。在复习备考时，最首要的是理清学科概念基本盘，了解特定情境下条件的约束关系，由此推演可归纳得出正确选择为 D。\n【易错点剖析】学生在解决《${kp}》相关客观题时，最经典、普遍的弱点是：容易将临界限制条件视若无睹，片面泛化使用单一定律，应加强对学科边界思维的归纳训练。`
            },
            {
              text: `【强化特训·变式二】针对【${kp}】的深层思考：假如题目中的某一项核心参数或情境表述发生变化，我们应如何对应修正解题思路？`,
              options: ["A. 保持思路不变，套用固有模板解答", "B. 根据题意重新构建思维网并针对细节辨析解答", "C. 直接抄录类似题目结论，猜测数字作答", "D. 放弃该题的步骤分析"],
              correctAnswer: "B",
              explanation: `【解析】在变式题中，改变变量通常是命题人设置思维卡点的重要手法。对于【${kp}】，我们在平时训练时应拒绝死记公式，回归底层物理/文史逻辑关系进行重新推导。故选 B。\n【易错点剖析】死记硬背、对同类变式题套用不适宜的范式是不丢分的关键。应该把注意力放到题目给定的崭新材料与假设条件中。`
            },
            {
              text: `【强化特训·变式三】关于【${kp}】的综合案例分析与典型特征总结：请结合常错陷阱，分析下列最佳应试策略。`,
              options: ["A. 忽视题目中任何隐性负面词", "B. 只看开头便草率作答", "C. 圈画关键名词并检查结果的物理/语境常识性合规性", "D. 盲目填入繁琐的假模假样解析"],
              correctAnswer: "C",
              explanation: `【解析】针对【${kp}】的综合分析，做题的关键切入点是圈画具有强约束力的词汇，并且在得到结果后利用生活的普通自然常识、语用契合度进行末尾检验，如此最合理也最稳妥，因此最佳选择是 C。\n【易错点剖析】在应对涉及到《${kp}》的考题时，学生容易犯“草率结题、丢三落四”的粗心毛病，缺乏审慎的二次复算与常识合理性检验习惯。`
            }
          ];
        }
        
        return res.json({
          success: true,
          variants: simulatedVariants,
          isSimulated: true,
          warning: "GEMINI_API_KEY was not configured. Application is running in high-fidelity simulation fallback mode."
        });
      }

      const prompt = `You are a high-school and secondary-school general subject teacher and tutor.
We have an original wrong question categorized as: Area: ${subject}, Knowledge Point: ${knowledgePoint}.
Here is the original problem:
Text: ${text}
Options: ${options ? JSON.stringify(options) : "None"}
Correct Answer: ${correctAnswer || "Unknown"}

Your goal is to generate exactly 3 variant problems ("举一反三") covering this same knowledge point.
Guidelines:
1. Cover the same core knowledge point (${knowledgePoint}) from different logical angles, varying the prompt, parameters, context, or question focus.
2. The difficulty should be equivalent to or slightly harder/graduated from the original question.
3. Keep the output extremely neat. If the original question used multiple choice alternatives, design multiple choice variants too!
4. For every generated variant, provide:
   - "text": The complete prompt for the variant problem.
   - "options": Array of 4 choices (e.g. ["A. ...", "B. ..."]) if multiple choices are suitable, else empty array.
   - "correctAnswer": The correct answer.
   - "explanation": Step-by-step resolution. MOST IMPORTANTLY, always include a prominent paragraph highlighting typical pitfalls prefixed with "【易错点剖析】" (e.g., "【易错点剖析】学生在此题型中极易忽视负数根的存在，或漏讨论系数为零的边界情况。"). This should capture cognitive mistakes kids make.

Return STRICTLY in JSON format matching the schema.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              variants: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "Text of the variant problem." },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of options (like ['A. ...', 'B. ...']) if it's choice-based, otherwise empty."
                    },
                    correctAnswer: { type: Type.STRING, description: "Correct final answer of the variant." },
                    explanation: { type: Type.STRING, description: "Step-by-step resolution, must include a paragraph labeled '【易错点剖析】'." }
                  },
                  required: ["text", "options", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["variants"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini.");
      }

      const result = JSON.parse(responseText.trim());
      res.json({ success: true, variants: result.variants });
    } catch (error: any) {
      console.error("Variants API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate variant questions." });
    }
  });

async function startServer() {
  // Serve static files in production as fallback
  if (process.env.NODE_ENV !== "production") {
    // Development server with Vite integration
    const viteModule = "vite";
    const { createServer: createViteServer } = await import(viteModule);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if we are not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Server started on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch((e) => {
    console.error("Fatal server startup error:", e);
  });
}

export default app;
