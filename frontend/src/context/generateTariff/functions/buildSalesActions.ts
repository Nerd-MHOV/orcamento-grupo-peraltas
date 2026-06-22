import RowModalDiscount from "../interfaces/rowModalDiscount";

/**
 * Monta o texto legível do campo "Ações de venda" do Kommo (807184):
 * - Desconto geral (quando % > 0): `Ação: <nome ou —> | Desconto: <X>%`.
 * - Descontos unitários por linha/quarto (cada um com % > 0):
 *   `Unitário — <nome>: <X>%`.
 * - Sem nenhum desconto → `Padrão`.
 *
 * Entradas vêm do orçamento no momento de salvar: ação/percentual gerais e a
 * lista de descontos unitários (`RowModalDiscount[]`).
 */
export function buildSalesActions(
  action: string | undefined,
  discountPercent: number,
  unitary: RowModalDiscount[] = []
): string {
  const parts: string[] = [];

  const general = Number(discountPercent) || 0;
  if (general > 0) {
    const name = (action ?? "").trim() || "—";
    parts.push(`Ação: ${name} | Desconto: ${general}%`);
  }

  (unitary ?? []).forEach((u) => {
    const pct = Number(u?.discount) || 0;
    if (pct > 0) {
      parts.push(`Unitário — ${u.name}: ${pct}%`);
    }
  });

  return parts.length > 0 ? parts.join("\n") : "Padrão";
}
