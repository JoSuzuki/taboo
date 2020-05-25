import React from 'react';
import { ICard } from "../../shared/constants";

interface CardProps {
  card: ICard;
}

const Card: React.FC<CardProps> = ({ card }) => {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid blue', borderRadius: '8px', margin: '20px' }}>
      <div>Card: {card.id}</div>
      <div style={{ fontSize: '20px' }}>Palavra:</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{card.word.toUpperCase()}</div>
      <div style={{ borderTop: '1px solid gray' }}></div>
      <div>Taboos:</div>
      {card.tabu.map(tabu => <div key={tabu}>{tabu}</div>)}
    </div>
  );
};

export default Card;