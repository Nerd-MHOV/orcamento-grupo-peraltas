import { TCreatedPdf } from "pdfmake/build/pdfmake";

/**
 * Wraps `pdf.getBlob` in a Promise that resolves with the generated Blob,
 * while still opening the PDF in a centered pop-up window (existing behavior).
 *
 * Returning the Blob is additive: callers that only need the `window.open`
 * side-effect can simply ignore the resolved value.
 */
function pdfToBlob(pdf: TCreatedPdf): Promise<Blob> {
  return new Promise<Blob>((resolve) => {
    pdf.getBlob((blob: Blob) => {
      // Converte o blob em uma URL de dados
      const url = URL.createObjectURL(blob);
      // Define o tamanho e posição da janela pop-up
      const width = 1000; // Largura da janela em pixels
      const height = 650; // Altura da janela em pixels
      const left = (window.innerWidth - width) / 2; // Centraliza a janela horizontalmente
      const top = (window.innerHeight - height) / 2; // Centraliza a janela verticalmente
      const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;

      // Abre a janela pop-up com o PDF
      window.open(url, '_blank', features);

      resolve(blob);
    });
  });
}

export default pdfToBlob;
