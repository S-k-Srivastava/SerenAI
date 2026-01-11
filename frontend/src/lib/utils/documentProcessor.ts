
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for PDF.js to use local file from public folder
if (typeof window !== 'undefined' && 'Worker' in window) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export type FileType = 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'text/plain';

export interface ProcessOptions {
    onProgress?: (progress: number) => void;
}

export const extractTextFromPdf = async (file: File, options?: ProcessOptions): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        
        // Initial progress
        if (options?.onProgress) options.onProgress(10);

        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';

            // Update progress based on pages processed
            if (options?.onProgress) {
                const percent = Math.round((i / totalPages) * 100);
                options.onProgress(percent);
            }
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

export const extractTextFromDocx = async (file: File, options?: ProcessOptions): Promise<string> => {
    try {
        if (options?.onProgress) options.onProgress(30); // Started
        const arrayBuffer = await file.arrayBuffer();
        if (options?.onProgress) options.onProgress(60); // Loaded
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (options?.onProgress) options.onProgress(100); // Finished
        return result.value.trim();
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from DOCX');
    }
};

export const extractTextFromTxt = async (file: File, options?: ProcessOptions): Promise<string> => {
    try {
        if (options?.onProgress) options.onProgress(50);
        const text = await file.text();
        if (options?.onProgress) options.onProgress(100);
        return text.trim();
    } catch (error) {
        console.error('Error extracting text from TXT:', error);
        throw new Error('Failed to extract text from TXT');
    }
};

export const processDocumentFile = async (file: File, options?: ProcessOptions): Promise<string> => {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return extractTextFromPdf(file, options);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return extractTextFromDocx(file, options);
    } else if (fileType === 'text/plain') {
        return extractTextFromTxt(file, options);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
    }
};
