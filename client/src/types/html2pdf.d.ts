declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number; [key: string]: unknown };
    html2canvas?: Record<string, unknown>;
    jsPDF?: { unit?: string; format?: string | number[]; orientation?: string | 'portrait' | 'landscape'; [key: string]: unknown };
    [key: string]: unknown;
  }

  interface Html2PdfWorker {
    from(element: HTMLElement | string): Html2PdfWorker;
    set(options: Html2PdfOptions): Html2PdfWorker;
    save(): Promise<void>;
    output(type: string): Promise<unknown>;
  }

  function html2pdf(): Html2PdfWorker;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}
