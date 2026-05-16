import { useNavigate } from 'react-router-dom';
import type { WatchlistEntry } from '../hooks/useWatchlistQuotes';
import { formatChange, formatPercent, formatPrice } from '../utils/format';

interface Props {
  entry: WatchlistEntry | undefined;
  symbol: string;
  onRemove: (symbol: string) => void;
}

export default function WatchlistRow({ entry, symbol, onRemove }: Props) {
  const navigate = useNavigate();
  const quote = entry?.quote;
  const profile = entry?.profile;
  const error = entry?.error;

  const isPositive = (quote?.d ?? 0) >= 0;
  const sign = isPositive ? 'positive' : 'negative';

  return (
    <div className="watchlist-row" onClick={() => navigate(`/stock/${symbol}`)}>
      <div className="cell-symbol">{symbol}</div>
      <div className="cell-name">{profile?.name ?? '—'}</div>
      <div className="cell-price">
        {error ? '⚠️' : quote ? formatPrice(quote.c, profile?.currency) : '…'}
      </div>
      <div className={`cell-change col-change ${sign}`}>
        {quote ? formatChange(quote.d) : '…'}
      </div>
      <div className={`cell-percent ${sign}`}>
        {quote ? formatPercent(quote.dp) : '…'}
      </div>
      <button
        className="btn-remove"
        aria-label={`${symbol} entfernen`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(symbol);
        }}
      >
        ×
      </button>
    </div>
  );
}
