import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCandles, getCompanyProfile, getQuote, getRangeUnix } from '../api/finnhub';
import type { ChartPoint, CompanyProfile, Quote } from '../types/finnhub';
import StockChart, { type SeriesData } from '../components/StockChart';
import CompareControl from '../components/CompareControl';
import {
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
} from '../utils/format';
import { useWatchlist } from '../hooks/useWatchlist';

type Range = '1W' | '1M' | '3M' | '6M' | '1J' | '5J';
const RANGES: Range[] = ['1W', '1M', '3M', '6M', '1J', '5J'];

const COMPARE_COLORS = ['#2f81f7', '#d29922', '#bc8cff', '#ff9eb8'];

export default function StockDetailPage() {
  const { symbol = '' } = useParams<{ symbol: string }>();
  const upper = symbol.toUpperCase();
  const { has, add, remove } = useWatchlist();
  const inWatchlist = has(upper);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<Range>('1M');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [compareSymbols, setCompareSymbols] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<Record<string, ChartPoint[]>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [q, p] = await Promise.all([
          getQuote(upper),
          getCompanyProfile(upper).catch(() => ({} as CompanyProfile)),
        ]);
        if (!cancelled) {
          setQuote(q);
          setProfile(p);
        }
      } catch {
        if (!cancelled) setError('Daten konnten nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [upper]);

  useEffect(() => {
    let cancelled = false;
    async function loadChart() {
      const { from, to, resolution } = getRangeUnix(range);
      const data = await getCandles(upper, resolution, from, to);
      if (!cancelled) setChart(data);
    }
    loadChart();
    return () => {
      cancelled = true;
    };
  }, [upper, range]);

  useEffect(() => {
    let cancelled = false;
    async function loadCompares() {
      const { from, to, resolution } = getRangeUnix(range);
      const entries = await Promise.all(
        compareSymbols.map(async (s) => {
          const data = await getCandles(s, resolution, from, to);
          return [s, data] as const;
        })
      );
      if (cancelled) return;
      const map: Record<string, ChartPoint[]> = {};
      entries.forEach(([s, d]) => {
        map[s] = d;
      });
      setCompareData(map);
    }
    loadCompares();
    return () => {
      cancelled = true;
    };
  }, [compareSymbols.join(','), range]);

  const positive = (quote?.d ?? 0) >= 0;
  const sign = positive ? 'positive' : 'negative';

  const compareSeries: SeriesData[] = compareSymbols.map((s, i) => ({
    symbol: s,
    color: COMPARE_COLORS[i % COMPARE_COLORS.length],
    points: compareData[s] ?? [],
  }));

  function addCompare(s: string) {
    const up = s.toUpperCase();
    if (up === upper) return;
    setCompareSymbols((prev) => (prev.includes(up) ? prev : [...prev, up]));
  }

  function removeCompare(s: string) {
    setCompareSymbols((prev) => prev.filter((x) => x !== s));
  }

  return (
    <>
      <Link to="/" className="back-btn">
        ← Zurück zur Watchlist
      </Link>

      {error && <div className="error">{error}</div>}

      {!error && (
        <>
          <div className="detail-header">
            <div className="detail-title-block">
              {profile?.logo && (
                <img src={profile.logo} alt="" className="detail-logo" />
              )}
              <div>
                <div className="detail-title">{profile?.name ?? upper}</div>
                <div className="detail-subtitle">
                  {upper}
                  {profile?.exchange ? ` · ${profile.exchange}` : ''}
                  {profile?.finnhubIndustry ? ` · ${profile.finnhubIndustry}` : ''}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="detail-price">
                {loading && !quote ? '…' : formatPrice(quote?.c, profile?.currency)}
              </div>
              <div className={`detail-change ${sign}`}>
                {quote
                  ? `${formatChange(quote.d)} (${formatPercent(quote.dp)})`
                  : ''}
              </div>
              <button
                className={`range-btn ${inWatchlist ? 'active' : ''}`}
                style={{ marginTop: 8 }}
                onClick={() => (inWatchlist ? remove(upper) : add(upper))}
              >
                {inWatchlist ? 'In Watchlist entfernen' : 'Zur Watchlist hinzufügen'}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="range-selector">
              {RANGES.map((r) => (
                <button
                  key={r}
                  className={`range-btn ${range === r ? 'active' : ''}`}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            <CompareControl
              symbols={compareSymbols}
              colors={COMPARE_COLORS}
              onAdd={addCompare}
              onRemove={removeCompare}
              max={2}
            />

            {compareSymbols.length > 0 && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Im Vergleichsmodus zeigt der Chart die %-Veränderung relativ zum
                Startdatum.
              </p>
            )}

            <StockChart
              data={chart}
              compareSeries={compareSeries}
              mainSymbol={upper}
              positive={positive}
            />
          </div>

          <div className="card">
            <h3 className="section-title">Kennzahlen</h3>
            <div className="stats-grid">
              <Stat label="Eröffnung" value={formatPrice(quote?.o, profile?.currency)} />
              <Stat label="Tageshoch" value={formatPrice(quote?.h, profile?.currency)} />
              <Stat label="Tagestief" value={formatPrice(quote?.l, profile?.currency)} />
              <Stat
                label="Vortagsschluss"
                value={formatPrice(quote?.pc, profile?.currency)}
              />
              <Stat
                label="Marktkapitalisierung"
                value={formatMarketCap(profile?.marketCapitalization)}
              />
              <Stat label="Währung" value={profile?.currency ?? '—'} />
              <Stat label="Land" value={profile?.country ?? '—'} />
              <Stat label="IPO" value={profile?.ipo ?? '—'} />
            </div>
            {profile?.weburl && (
              <p style={{ marginTop: '1rem' }}>
                <a href={profile.weburl} target="_blank" rel="noopener noreferrer">
                  Website →
                </a>
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
