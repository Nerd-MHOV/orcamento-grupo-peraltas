export interface AppHotelProps {
  reservas: {
    id: string,
    type_reserv_code: string,
    reserv_code: string,
    date_init: string,
    date_end: string,
    adt: number,
    chd: number,
    room: string,
    situation: string,
  };
  qtd_reservas: number;
  processadas: number;
  confirmadas: number;
  bloqueios: number;
  adt: number;
  chd: number;
}
