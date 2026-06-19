import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { TCreatedPdf } from "pdfmake/build/pdfmake";
import pdfToBlob from "../pdfToBlob";

// Ambiente de testes é "node": não há `window`/`URL.createObjectURL` globais.
// Stubamos os dois para validar que o comportamento de `window.open` permanece
// intacto enquanto o Blob passa a ser exposto via Promise.
const openMock = vi.fn();
const createObjectURLMock = vi.fn(() => "blob:fake-url");

beforeEach(() => {
  openMock.mockClear();
  createObjectURLMock.mockClear();

  vi.stubGlobal("window", {
    open: openMock,
    innerWidth: 1920,
    innerHeight: 1080,
  });
  vi.stubGlobal("URL", { createObjectURL: createObjectURLMock });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Cria um fake mínimo de `TCreatedPdf` cujo `getBlob` chama o callback com o
 * Blob fornecido — equivalente a mockar `createPdf(...).getBlob(cb)`.
 */
const makeFakePdf = (blob: Blob): TCreatedPdf =>
  ({
    getBlob: (cb: (result: Blob) => void) => cb(blob),
  } as unknown as TCreatedPdf);

describe("pdfToBlob", () => {
  it("resolve com o Blob gerado pelo getBlob", async () => {
    const blob = new Blob(["%PDF"]);
    const fakePdf = makeFakePdf(blob);

    const result = await pdfToBlob(fakePdf);

    expect(result).toBe(blob);
    expect(result).toBeInstanceOf(Blob);
  });

  it("ainda abre o PDF em pop-up via window.open (comportamento preservado)", async () => {
    const blob = new Blob(["%PDF"]);
    const fakePdf = makeFakePdf(blob);

    await pdfToBlob(fakePdf);

    expect(createObjectURLMock).toHaveBeenCalledWith(blob);
    expect(openMock).toHaveBeenCalledTimes(1);
    expect(openMock).toHaveBeenCalledWith(
      "blob:fake-url",
      "_blank",
      expect.stringContaining("width=1000"),
    );
  });
});
