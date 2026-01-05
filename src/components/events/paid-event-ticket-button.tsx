'use client';

import { useState, useEffect } from 'react';
import { Ticket, ShoppingCart, CheckCircle } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import Link from 'next/link';

interface PaidEventTicketButtonProps {
  eventId: string;
  eventTitle: string;
  ticketPricePoints: number;
  ticketPriceUah?: number;
  ticketQuantity: number | null;
  ticketsSold: number;
  hasTicket: boolean;
  onTicketPurchased?: () => void;
}

export function PaidEventTicketButton({
  eventId,
  eventTitle,
  ticketPricePoints,
  ticketPriceUah,
  ticketQuantity,
  ticketsSold,
  hasTicket,
  onTicketPurchased,
}: PaidEventTicketButtonProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [purchased, setPurchased] = useState(hasTicket);

  useEffect(() => {
    fetchUserBalance();
  }, []);

  async function fetchUserBalance() {
    try {
      const response = await fetch('/api/me/points');
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.balance.total);
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }

  const soldOut = ticketQuantity !== null && ticketsSold >= ticketQuantity;
  const canAfford = userBalance !== null && userBalance >= ticketPricePoints;
  const remainingTickets = ticketQuantity !== null ? ticketQuantity - ticketsSold : null;

  const handlePurchase = async () => {
    if (!canAfford) {
      setError('Недостатньо балів для придбання квитка');
      return;
    }

    setPurchasing(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/events/${eventId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to purchase ticket');
      }

      const data = await response.json();
      setPurchased(true);
      onTicketPurchased?.();

      // Refresh balance
      await fetchUserBalance();

      // Show success message
      alert(data.message || 'Квиток успішно придбано!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка при придбанні квитка');
    } finally {
      setPurchasing(false);
    }
  };

  const uahValue = pointsToUAH(ticketPricePoints);

  // Already purchased
  if (purchased) {
    return (
      <div className="bg-green-50 border-2 border-green-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle size={24} className="text-green-600" />
          <div>
            <h3 className="font-syne font-bold text-green-600">Квиток придбано</h3>
            <p className="text-sm text-green-700">Ви маєте квиток на цю подію</p>
          </div>
        </div>
        <Link
          href="/dashboard/marketplace/orders"
          className="text-sm text-green-600 hover:underline inline-flex items-center gap-2"
        >
          Переглянути мої замовлення
        </Link>
      </div>
    );
  }

  // Sold out
  if (soldOut) {
    return (
      <div className="bg-gray-100 border-2 border-gray-400 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Ticket size={24} className="text-gray-500" />
          <h3 className="font-syne font-bold text-gray-600">Квитки розпродані</h3>
        </div>
        <p className="text-sm text-gray-600">
          На жаль, всі квитки на цю подію вже розпродані
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Ticket size={24} className="text-bronze" />
          <div>
            <h3 className="font-syne font-bold">Придбати квиток</h3>
            <p className="text-sm text-muted-500">
              Для участі потрібен квиток
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-syne text-2xl font-bold text-bronze">
            {ticketPricePoints}
          </p>
          <p className="text-xs text-muted-500">≈ {uahValue.toFixed(0)} грн</p>
        </div>
      </div>

      {remainingTickets !== null && (
        <p className="text-sm text-muted-500 mb-4">
          Залишилось квитків: {remainingTickets}
        </p>
      )}

      {userBalance !== null && (
        <p className="text-sm mb-4">
          Ваш баланс:{' '}
          <span className={canAfford ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {userBalance} балів
          </span>
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-600 p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={purchasing || !canAfford}
        className={`w-full py-3 px-4 font-bold transition-colors flex items-center justify-center gap-2 ${
          purchasing || !canAfford
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-bronze text-canvas hover:bg-bronze/90'
        }`}
      >
        <ShoppingCart size={20} />
        {purchasing ? 'Обробка...' : canAfford ? 'Придбати квиток' : 'Недостатньо балів'}
      </button>

      {!canAfford && userBalance !== null && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-500 mb-2">
            Вам потрібно ще {ticketPricePoints - userBalance} балів
          </p>
          <Link
            href="/dashboard/points"
            className="text-sm text-bronze hover:underline"
          >
            Як заробити бали?
          </Link>
        </div>
      )}
    </div>
  );
}
