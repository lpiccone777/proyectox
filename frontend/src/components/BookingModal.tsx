import React, { useState } from 'react';
import { bookingsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface BookingModalProps {
  space: {
    id: number;
    title: string;
    pricePerMonth: number;
    pricePerDay?: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ space, onClose, onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (space.pricePerDay) {
      return diffDays * space.pricePerDay;
    } else {
      // Si no hay precio por día, calcular basado en precio mensual
      return (space.pricePerMonth / 30) * diffDays;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await bookingsAPI.create({
        spaceId: space.id,
        startDate,
        endDate,
        totalPrice: calculateTotalPrice()
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Fecha mínima es hoy
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Reservar: {space.title}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Fecha de inicio
            </label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Fecha de fin
            </label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {startDate && endDate && (
            <div className="summary-box">
              <h3 className="summary-title">Resumen de la reserva</h3>
              <p className="summary-price">${calculateTotalPrice().toFixed(2)}</p>
              <p className="summary-details">
                {space.pricePerDay 
                  ? `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} días × $${space.pricePerDay}/día`
                  : `Calculado en base a $${space.pricePerMonth}/mes`
                }
              </p>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !startDate || !endDate}
              className="btn btn-success"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;