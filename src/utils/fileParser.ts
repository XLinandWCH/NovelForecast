import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set worker path for pdfjs (v5+ uses .mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const parseFile = async (file: File): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "txt") {
    return await file.text();
  } else if (extension === "pdf") {
    return await parsePDF(file);
  } else if (extension === "docx") {
    return await parseDocx(file);
  } else {
    throw new Error("Unsupported file type");
  }
};

const parsePDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    throw new Error(`PDF 解析失败: ${error.message || '未知错误'}`);
  }
};

const parseDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error: any) {
    console.error("DOCX Parsing Error:", error);
    throw new Error(`DOCX 解析失败: ${error.message || '未知错误'}`);
  }
};
