import React from 'react';

const InsightCloud = (props: {
    mousePosition: { x: number; y: number };
    insights: {
        total: number;
        totalUtil: number;
        ganho: number;
        perdido: number;
        emAndamento: number;
        vencido: number;
        aguardando: number;
        refeito: number;
        none: number;
    };
}) => {
  const circleStyle = (color: string) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    marginRight: '10px',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: props.mousePosition.y,
        left: props.mousePosition.x,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000,
        pointerEvents: 'none', // Ensure the box doesn't interfere with mouse events
        transform: 'translate(-20%, -50%)', // Center the box relative to the cursor
        minWidth: '200px', // Increase the minimum width
      }}
    >
      <h4 style={{ margin: 0, padding: 0, color: '#333' }}>Insights</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Total</span>
        <span>{props.insights.total}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Total Util</span>
        <span>{props.insights.totalUtil}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('green')}></span>Ganho</span>
        <span>{props.insights.ganho}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('red')}></span>Perdido</span>
        <span>{props.insights.perdido}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('blue')}></span>Em Andamento</span>
        <span>{props.insights.emAndamento}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('orange')}></span>Vencido</span>
        <span>{props.insights.vencido}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('purple')}></span>Aguardando</span>
        <span>{props.insights.aguardando}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('gray')}></span>Refeito</span>
        <span>{props.insights.refeito}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span><span style={circleStyle('white')}></span>None</span>
        <span>{props.insights.none}</span>
      </div>
    </div>
  );
};

export default InsightCloud;