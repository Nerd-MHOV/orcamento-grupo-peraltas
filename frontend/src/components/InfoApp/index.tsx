import { AppHotelProps } from "../../hooks/appHotel/interfaces";

interface InfoAppProps {
  stateApp: AppHotelProps | null;
}
export const InfoApp = ({ stateApp }: InfoAppProps) => (
  <div className="infoApp">
    {stateApp !== null && !!stateApp.qtd_reservas && (
      <div className="infoAppBox">
        <div>
          <p>Confirmadas: {stateApp.confirmadas}</p>
          <p>Bloqueios: {stateApp.bloqueios}</p>
        </div>
        <div>
          <p>Processadas: {stateApp.processadas}</p>
          <p>Total Reservas: {stateApp.qtd_reservas}</p>
        </div>
      </div>
    )}
  </div>
);
