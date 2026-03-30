import React, {useEffect, useState} from 'react';
import './dawg.css'

// ─── About Page ──────────────────────────────────────────────────────────────
const AboutPage = () => (
    <div className="page-content about-page">
        <div className="about-hero">
            <h1 className="about-title">dawg <span>🐶</span></h1>
            <p className="about-subtitle">a march madness betting tracker built on one simple idea:</p>
            <p className="about-tagline">always bet the underdog.</p>
        </div>

        <div className="about-cards">
            <div className="about-card">
                <div className="about-card-icon">🐶</div>
                <h3>The Strategy</h3>
                <p>
                    The underdog strategy is simple: upsets happen more than oddsmakers expect,
                    and the payout on a surprise win can offset multiple losses. March Madness is
                    historically the best tournament for upsets - dawg tracks whether that theory holds up
                    in real money terms.
                </p>
            </div>

            <div className="about-card">
                <div className="about-card-icon">📊</div>
                <h3>How It Works</h3>
                <p>
                    dawg pulls live odds from sportsbooks and identifies the underdog in every March Madness matchup -
                    the team with the higher (positive) moneyline odds. You pick a flat bet amount, and we track
                    what would happen if you blindly backed the dog (or the favorite) every single game.
                </p>
            </div>

            <div className="about-card">
                <div className="about-card-icon">👑</div>
                <h3>Favorite Mode</h3>
                <p>
                    Flip to <strong>favorite mode</strong> to see the other side of the coin - betting the expected
                    winner every game. Higher win rate, lower payouts. Compare both strategies over the
                    tournament to see which one actually makes money.
                </p>
            </div>

            <div className="about-card">
                <div className="about-card-icon">💸</div>
                <h3>Reading the Odds</h3>
                <p>
                    American odds tell you profit on a $100 bet. <strong>+200</strong> means bet $100, win $200 profit.
                    <strong> -150</strong> means bet $150 to win $100 profit. Underdogs always carry
                    a <strong>+</strong> line;
                    favorites carry a <strong>−</strong> line. Pick'em games (equal odds) are tracked separately and
                    don't count toward P/L.
                </p>
            </div>
        </div>

        <div className="about-disclaimer">
            <p>⚠️ dawg is for entertainment and educational purposes only. no real money is involved. gamble
                responsibly.</p>
        </div>
    </div>
);

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ runningPL, totalPL }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const svgH = 100, svgW = 300, pad = 10;
    const minPL = Math.min(...runningPL);
    const maxPL = Math.max(...runningPL);
    const range = maxPL - minPL || 1;
    const toY = v => pad + ((maxPL - v) / range) * (svgH - pad * 2);
    const points = runningPL.map((v, i) => ({
        x: pad + (i / Math.max(runningPL.length - 1, 1)) * (svgW - pad * 2),
        y: toY(v),
        pl: v,
    }));

    return (
        <div className="sparkline-card">
            <h3>Running P/L</h3>
            <div className="sparkline-wrap">
                <div className="sparkline-yaxis">
                    <span>{maxPL >= 0 ? '+' : ''}${maxPL.toFixed(0)}</span>
                    {minPL < 0 && maxPL > 0 && <span>$0</span>}
                    <span>{minPL >= 0 ? '+' : ''}${minPL.toFixed(0)}</span>
                </div>
                <div className="sparkline-svg-wrap">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="sparkline"
                         onMouseLeave={() => setHoveredIdx(null)}>
                        {minPL < 0 && maxPL > 0 && (
                            <line
                                x1={pad} y1={toY(0)}
                                x2={svgW - pad} y2={toY(0)}
                                stroke="var(--border-medium)"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />
                        )}
                        <polyline
                            points={points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke={totalPL >= 0 ? 'var(--win-green-soft)' : 'var(--loss-red-soft)'}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {points.map((p, i) => (
                            <circle
                                key={i}
                                cx={p.x} cy={p.y}
                                r={hoveredIdx === i ? 5 : 3}
                                fill={p.pl >= 0 ? 'var(--win-green-soft)' : 'var(--loss-red-soft)'}
                                stroke="var(--bg-card)"
                                strokeWidth="1.5"
                                style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                                onMouseEnter={() => setHoveredIdx(i)}
                            />
                        ))}
                        {hoveredIdx !== null && (() => {
                            const p = points[hoveredIdx];
                            const label = `${p.pl >= 0 ? '+' : ''}$${p.pl.toFixed(2)}`;
                            const boxW = 76, boxH = 22;
                            const bx = Math.min(Math.max(p.x - boxW / 2, 0), svgW - boxW);
                            const by = p.y - boxH - 8 < 0 ? p.y + 8 : p.y - boxH - 8;
                            return (
                                <g pointerEvents="none">
                                    <rect x={bx} y={by} width={boxW} height={boxH}
                                          rx="4" fill="var(--bg-elevated)"
                                          stroke="var(--border-medium)" strokeWidth="1"/>
                                    <text x={bx + boxW / 2} y={by + 15}
                                          textAnchor="middle"
                                          fill={p.pl >= 0 ? 'var(--win-green-soft)' : 'var(--loss-red-soft)'}
                                          fontSize="11" fontFamily="Space Mono, monospace" fontWeight="700">
                                        {label}
                                    </text>
                                </g>
                            );
                        })()}
                    </svg>
                </div>
            </div>
            <div className="sparkline-labels">
                <span>Game 1</span>
                <span>Game {runningPL.length}</span>
            </div>
        </div>
    );
};

const MM_ROUNDS = [
    { name: "First Four",   start: new Date("2026-03-18"), end: new Date("2026-03-19") },
    { name: "Round of 64",  start: new Date("2026-03-19"), end: new Date("2026-03-21") },
    { name: "Round of 32",  start: new Date("2026-03-21"), end: new Date("2026-03-23") },
    { name: "Sweet 16",     start: new Date("2026-03-26"), end: new Date("2026-03-28") },
    { name: "Elite Eight",  start: new Date("2026-03-28"), end: new Date("2026-03-30") },
    { name: "Final Four",   start: new Date("2026-04-04"), end: new Date("2026-04-04") },
    { name: "Championship", start: new Date("2026-04-06"), end: new Date("2026-04-06") },
];

const getRound = (startTime) => {
    const d = new Date(startTime);
    d.setHours(0, 0, 0, 0);
    for (const r of MM_ROUNDS) {
        const s = new Date(r.start); s.setHours(0, 0, 0, 0);
        const e = new Date(r.end);   e.setHours(23, 59, 59, 999);
        if (d >= s && d <= e) return r.name;
    }
};

const ROUND_ORDER = [...MM_ROUNDS.map(r => r.name), "Other"];

const StatsPage = ({ results, tossupGames, betAmount, bettingMode }) => {
    const isFavoriteMode = bettingMode === 'favorite';
    const modeLabel = isFavoriteMode ? 'Favorite' : 'Underdog';

    const wins      = results.filter(g => g.pickWon).length;
    const losses    = results.filter(g => !g.pickWon).length;
    const totalBets = results.length;
    const winRate   = totalBets > 0 ? (wins / totalBets * 100) : 0;
    const totalPL   = results.reduce((sum, g) => sum + g.potentialProfit, 0);
    const roi       = totalBets > 0 ? (totalPL / (betAmount * totalBets) * 100) : 0;
    const biggestWin = results
        .filter(g => g.pickWon)
        .sort((a, b) => b.potentialProfit - a.potentialProfit)[0];

    let running = 0;
    const runningPL = results
        .slice()
        .sort((a, b) => a.startTime - b.startTime)
        .map(g => { running += g.potentialProfit; return running; });

    const perfectPL = results.reduce((sum, g) => {
        const winnerWasFavorite = g.winner === g.favorite;
        const winnerOdds = winnerWasFavorite ? g.favoriteOdds : g.underdogOdds;
        if (!winnerOdds) return sum;
        const profit = winnerOdds > 0
            ? betAmount * winnerOdds / 100
            : betAmount * 100 / Math.abs(winnerOdds);
        return sum + profit;
    }, 0);
    const perfectROI = totalBets > 0 ? (perfectPL / (betAmount * totalBets) * 100) : 0;

    const roundMap = {};
    results.forEach(g => {
        const round = getRound(g.startTime);
        if (!roundMap[round]) roundMap[round] = { wins: 0, losses: 0, pickems: 0, pl: 0 };
        roundMap[round].wins   += g.pickWon ? 1 : 0;
        roundMap[round].losses += g.pickWon ? 0 : 1;
        roundMap[round].pl     += g.potentialProfit;
    });
    tossupGames.forEach(g => {
        const round = getRound(g.startTime);
        if (!roundMap[round]) roundMap[round] = { wins: 0, losses: 0, pickems: 0, pl: 0 };
        roundMap[round].pickems += 1;
    });

    const roundRows = ROUND_ORDER
        .filter(r => roundMap[r])
        .map(r => {
            const { wins: rw, losses: rl, pickems: rp, pl: rpl } = roundMap[r];
            const total = rw + rl;
            return {
                name: r,
                wins: rw,
                losses: rl,
                pickems: rp || 0,
                total,
                winRate: total > 0 ? (rw / total * 100) : 0,
                pl: rpl,
                roi: total > 0 ? (rpl / (betAmount * total) * 100) : 0,
            };
        });

    return (
        <div className="page-content stats-page">
            <h2 className="stats-title">{modeLabel} Stats</h2>

            <div className="stats-grid">
                <div className="stat-tile">
                    <span className="stat-tile-value">${betAmount}</span>
                    <span className="stat-tile-label">Bet Size</span>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile-value">{totalBets}</span>
                    <span className="stat-tile-label">Total Bets</span>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile-value">{wins}</span>
                    <span className="stat-tile-label">Wins</span>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile-value">{losses}</span>
                    <span className="stat-tile-label">Losses</span>
                </div>
                <div className="stat-tile">
                    <span className="stat-tile-value">{tossupGames.length}</span>
                    <span className="stat-tile-label">Pick'ems</span>
                </div>
                <div className={`stat-tile ${winRate >= 25 ? 'positive' : 'negative'}`}>
                    <span className="stat-tile-value">{totalBets > 0 ? `${winRate.toFixed(1)}%` : '—'}</span>
                    <span className="stat-tile-label">Win Rate</span>
                </div>
                <div className={`stat-tile ${totalPL > 0 ? 'positive' : totalPL < 0 ? 'negative' : ''}`}>
                    <span className="stat-tile-value">{totalBets > 0 ? `${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}` : '—'}</span>
                    <span className="stat-tile-label">P / L</span>
                </div>
                <div className={`stat-tile ${roi > 0 ? 'positive' : roi < 0 ? 'negative' : ''}`}>
                    <span className="stat-tile-value">{totalBets > 0 ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}</span>
                    <span className="stat-tile-label">ROI</span>
                </div>
            </div>

            {runningPL.length > 1 && (
                <Sparkline runningPL={runningPL} totalPL={totalPL} />
            )}

            <div className="highlights-row">
                {biggestWin && (
                    <div className="highlight-card win">
                        <div className="highlight-label">💰 Biggest Win</div>
                        <div className="highlight-teams">{biggestWin.homeTeam} vs {biggestWin.awayTeam}</div>
                        <div className="highlight-amount">+${biggestWin.potentialProfit.toFixed(2)}</div>
                        <div className="highlight-date">{getRound(biggestWin.startTime)} · {biggestWin.startTime.toLocaleDateString()}</div>
                    </div>
                )}
            </div>

            {roundRows.length > 0 && (
                <div className="round-breakdown">
                    <h3 className="section-heading">By Round</h3>
                    <div className="round-table-wrap">
                        <table className="round-table">
                            <thead>
                            <tr>
                                <th>Round</th>
                                <th>W</th>
                                <th>L</th>
                                <th>Pick'em</th>
                                <th>Win %</th>
                                <th>P / L</th>
                                <th>ROI</th>
                            </tr>
                            </thead>
                            <tbody>
                            {roundRows.map(r => (
                                <tr key={r.name}>
                                    <td className="round-name">{r.name}</td>
                                    <td className="round-wins">{r.wins}</td>
                                    <td className="round-losses">{r.losses}</td>
                                    <td className="round-pickems">{r.pickems > 0 ? r.pickems : '—'}</td>
                                    <td>{r.total > 0 ? `${r.winRate.toFixed(0)}%` : '—'}</td>
                                    <td className={r.pl > 0 ? 'positive' : r.pl < 0 ? 'negative' : ''}>
                                        {r.total > 0 ? `${r.pl >= 0 ? '+' : ''}$${r.pl.toFixed(2)}` : '—'}
                                    </td>
                                    <td className={r.roi > 0 ? 'positive' : r.roi < 0 ? 'negative' : ''}>
                                        {r.total > 0 ? `${r.roi >= 0 ? '+' : ''}${r.roi.toFixed(1)}%` : '—'}
                                    </td>
                                </tr>
                            ))}
                            <tr className="round-totals-row">
                                <td>Total</td>
                                <td>{wins}</td>
                                <td>{losses}</td>
                                <td>{tossupGames.length > 0 ? tossupGames.length : '—'}</td>
                                <td>{totalBets > 0 ? `${winRate.toFixed(0)}%` : '—'}</td>
                                <td className={totalPL > 0 ? 'positive' : totalPL < 0 ? 'negative' : ''}>
                                    {totalBets > 0 ? `${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}` : '—'}
                                </td>
                                <td className={roi > 0 ? 'positive' : roi < 0 ? 'negative' : ''}>
                                    {totalBets > 0 ? `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%` : '—'}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalBets > 0 && (
                <div className="perfect-picks-section">
                    <h3 className="section-heading">What if you bet every winner?</h3>

                    <div className="perfect-picks-compare">
                        <div className={`compare-card ${totalPL >= 0 ? 'compare-card--positive' : 'compare-card--negative'}`}>
                            <div className="compare-card-label">Your strategy</div>
                            <div className="compare-card-subtitle">{modeLabel} every game</div>
                            <div className="compare-card-metric">
                                <span className="compare-metric-value">{wins}/{totalBets}</span>
                                <span className="compare-metric-label">wins</span>
                            </div>
                            <div className="compare-card-metric">
                                <span className={`compare-metric-value ${totalPL >= 0 ? 'positive' : 'negative'}`}>
                                    {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                                </span>
                                <span className="compare-metric-label">P / L</span>
                            </div>
                            <div className="compare-card-metric">
                                <span className={`compare-metric-value ${roi >= 0 ? 'positive' : 'negative'}`}>
                                    {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                                </span>
                                <span className="compare-metric-label">ROI</span>
                            </div>
                        </div>

                        <div className="compare-vs">vs</div>

                        <div className="compare-card compare-card--perfect">
                            <div className="compare-card-label">Perfect picks</div>
                            <div className="compare-card-subtitle">Bet every winner (hindsight)</div>
                            <div className="compare-card-metric">
                                <span className="compare-metric-value">{totalBets}/{totalBets}</span>
                                <span className="compare-metric-label">wins</span>
                            </div>
                            <div className="compare-card-metric">
                                <span className="compare-metric-value positive">
                                    +${perfectPL.toFixed(2)}
                                </span>
                                <span className="compare-metric-label">P / L</span>
                            </div>
                            <div className="compare-card-metric">
                                <span className="compare-metric-value positive">
                                    +{perfectROI.toFixed(1)}%
                                </span>
                                <span className="compare-metric-label">ROI</span>
                            </div>
                        </div>
                    </div>

                    <div className="perfect-picks-gap">
                        <span className="gap-amount">${(perfectPL - totalPL).toFixed(2)}</span>
                        <span className="gap-label">on the table</span>
                    </div>
                </div>
            )}

            {totalBets === 0 && (
                <p className="empty-state">no results yet — check back after some games complete 🐶</p>
            )}

            <div className="about-disclaimer">
                <p>⚠️ dawg is for entertainment and educational purposes only. no real money is involved. gamble responsibly.</p>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UnderdogTracker = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [profitLoss, setProfitLoss] = useState(0);
    const [betAmount, setBetAmount] = useState(10);
    const [showCompleted, setShowCompleted] = useState(true);
    const [sortMethod, setSortMethod] = useState('time');
    const [filterByTeams] = useState(true);
    const [bettingMode, setBettingMode] = useState('underdog');
    const [tossupGames, setTossupGames] = useState([]);
    const [completedGamesData, setCompletedGamesData] = useState([]);
    const [activePage, setActivePage] = useState(() => sessionStorage.getItem('dawg_page') || 'about');
    const [showGamesArrow, setShowGamesArrow] = useState(() => sessionStorage.getItem('dawg_arrow') !== 'false');

    const COMPLETED_GAMES_CACHE_KEY = "underdogCompletedGamesCache_v0";

    const isFavoriteMode = bettingMode === 'favorite';
    const modeLabel = isFavoriteMode ? 'Favorite' : 'Underdog';
    const modeEmoji = isFavoriteMode ? '👑' : '🐶';

    const getPickTeam = (game) => isFavoriteMode ? game.favorite : game.underdog;
    const getPickOdds = (game) => isFavoriteMode ? game.favoriteOdds : game.underdogOdds;
    const getPickWon = (game) => game.winner === getPickTeam(game);

    const handleManualRefresh = () => {
        setLoading(true);
        setError(null);
        fetchOddsForSport();
    };

    const handleGamesClick = () => {
        setActivePage('home');
        setShowGamesArrow(false);
    };

    const teamNameMap = {
        "Duke": "Duke Blue Devils",
        "Siena": "Siena Saints",
        "Ohio State": "Ohio State Buckeyes",
        "TCU": "TCU Horned Frogs",
        "St. John's": "St. John's Red Storm",
        "Northern Iowa": "Northern Iowa Panthers",
        "Kansas": "Kansas Jayhawks",
        "Cal Baptist": "Cal Baptist Lancers",
        "Louisville": "Louisville Cardinals",
        "South Florida": "South Florida Bulls",
        "Michigan State": "Michigan St Spartans",
        "North Dakota State": "North Dakota St Bison",
        "UCLA": "UCLA Bruins",
        "UCF": "UCF Knights",
        "UConn": "UConn Huskies",
        "Furman": "Furman Paladins",
        "Arizona": "Arizona Wildcats",
        "Long Island": "LIU Sharks",
        "Villanova": "Villanova Wildcats",
        "Utah State": "Utah State Aggies",
        "Wisconsin": "Wisconsin Badgers",
        "High Point": "High Point Panthers",
        "Arkansas": "Arkansas Razorbacks",
        "Hawaii": "Hawai'i Rainbow Warriors",
        "BYU": "BYU Cougars",
        "Texas": "Texas Longhorns",
        "NC State": "NC State Wolfpack",
        "Gonzaga": "Gonzaga Bulldogs",
        "Kennesaw State": "Kennesaw St Owls",
        "Miami": "Miami Hurricanes",
        "Missouri": "Missouri Tigers",
        "Purdue": "Purdue Boilermakers",
        "Queens": "Queens University Royals",
        "Florida": "Florida Gators",
        "Prairie View": "Prairie View Panthers",
        "Lehigh": "Lehigh Mountain Hawks",
        "Clemson": "Clemson Tigers",
        "Iowa": "Iowa Hawkeyes",
        "Vanderbilt": "Vanderbilt Commodores",
        "McNeese": "McNeese Cowboys",
        "Nebraska": "Nebraska Cornhuskers",
        "Troy": "Troy Trojans",
        "North Carolina": "North Carolina Tar Heels",
        "VCU": "VCU Rams",
        "Illinois": "Illinois Fighting Illini",
        "Penn": "Pennsylvania Quakers",
        "Saint Mary's": "Saint Mary's Gaels",
        "Texas A&M": "Texas A&M Aggies",
        "Houston": "Houston Cougars",
        "Idaho": "Idaho Vandals",
        "Michigan": "Michigan Wolverines",
        "Howard": "Howard Bison",
        "UMBC": "UMBC Retrievers",
        "Georgia": "Georgia Bulldogs",
        "Saint Louis": "Saint Louis Billikens",
        "Texas Tech": "Texas Tech Red Raiders",
        "Akron": "Akron Zips",
        "Alabama": "Alabama Crimson Tide",
        "Hofstra": "Hofstra Pride",
        "Tennessee": "Tennessee Volunteers",
        "SMU": "SMU Mustangs",
        "Miami (Ohio)": "Miami (OH) RedHawks",
        "Virginia": "Virginia Cavaliers",
        "Wright State": "Wright St Raiders",
        "Kentucky": "Kentucky Wildcats",
        "Santa Clara": "Santa Clara Broncos",
        "Iowa State": "Iowa State Cyclones",
        "Tennessee State": "Tennessee St Tigers",
    };

    const apiTeamNames = new Set(Object.values(teamNameMap));

    const involvesTournamentTeam = (game) => {
        if (!filterByTeams) return true;
        return apiTeamNames.has(game.homeTeam) || apiTeamNames.has(game.awayTeam);
    };

    const sortGames = (games, method) => {
        if (method === 'time') {
            return [...games].sort((a, b) => a.startTime - b.startTime);
        } else if (method === 'timeDesc') {
            return [...games].sort((a, b) => b.startTime - a.startTime);
        } else if (method === 'profit') {
            return [...games].sort((a, b) => {
                const profitA = calculatePotentialProfit(getPickOdds(a), betAmount);
                const profitB = calculatePotentialProfit(getPickOdds(b), betAmount);
                return profitB - profitA;
            });
        } else if (method === 'profitDesc') {
            return [...games].sort((a, b) => {
                const profitA = calculatePotentialProfit(getPickOdds(a), betAmount);
                const profitB = calculatePotentialProfit(getPickOdds(b), betAmount);
                return profitA - profitB;
            });
        }
        return games;
    };

    useEffect(() => {
        fetchOddsForSport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        sessionStorage.setItem('dawg_page', activePage);
        sessionStorage.setItem('dawg_arrow', showGamesArrow);
    }, [activePage, showGamesArrow]);

    const fetchOddsForSport = async () => {
        try {
            setLoading(true);
            const response = await fetch('/odds.json');
            const oddsData = await response.json();

            const scoresResponse = await fetch('/scores.json');
            const scoresData = await scoresResponse.json();

            const oddsMap = {};
            oddsData.forEach(game => {
                const bookmaker = game.bookmakers?.find(b => b.key === 'draftkings') ?? game.bookmakers?.[0];
                if (bookmaker) {
                    const h2hMarket = bookmaker.markets?.find(m => m.key === 'h2h');
                    if (h2hMarket) {
                        const outcomes = h2hMarket.outcomes;
                        const homeTeam = game.home_team;
                        const awayTeam = game.away_team;
                        const homeOdds = outcomes.find(o => o.name === homeTeam)?.price;
                        const awayOdds = outcomes.find(o => o.name === awayTeam)?.price;
                        if (homeOdds && awayOdds) {
                            const key = [homeTeam, awayTeam].sort().join('|');
                            oddsMap[key] = {
                                underdog: homeOdds > awayOdds ? homeTeam : awayTeam,
                                underdogOdds: homeOdds > awayOdds ? homeOdds : awayOdds,
                                favorite: homeOdds > awayOdds ? awayTeam : homeTeam,
                                favoriteOdds: homeOdds > awayOdds ? awayOdds : homeOdds,
                            };
                        }
                    }
                }
            });

            const cachedCompletedGames = JSON.parse(localStorage.getItem(COMPLETED_GAMES_CACHE_KEY) || '[]');
            const newCompletedGames = scoresData
                .filter(score =>
                    score.completed && score.scores &&
                    !cachedCompletedGames.some(cached => cached.id === score.id)
                )
                .map(score => ({
                    ...score,
                    ...( oddsMap[[score.home_team, score.away_team].sort().join('|')] || {})
                }));

            const mergedCompletedGames = [...cachedCompletedGames, ...newCompletedGames];
            localStorage.setItem(COMPLETED_GAMES_CACHE_KEY, JSON.stringify(mergedCompletedGames));
            setCompletedGamesData(mergedCompletedGames);

            const processedGames = processGamesData(oddsData);
            setGames(processedGames);
            setLoading(false);
        } catch (err) {
            setError('Error fetching data: ' + err.message);
            setLoading(false);
        }
    };

    const processGamesData = (gamesData) => {
        return gamesData.map(game => {
            let homeTeam, awayTeam, homeOdds, awayOdds, underdog, underdogOdds, favorite, favoriteOdds;
            const bookmaker = game.bookmakers?.find(b => b.key === 'draftkings') ?? game.bookmakers?.[0];

            if (bookmaker) {
                const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
                if (h2hMarket) {
                    const outcomes = h2hMarket.outcomes;
                    homeTeam = game.home_team || outcomes[0].name;
                    awayTeam = game.away_team || outcomes[1].name;
                    homeOdds = outcomes.find(o => o.name === homeTeam)?.price;
                    awayOdds = outcomes.find(o => o.name === awayTeam)?.price;

                    if (homeOdds > awayOdds) {
                        underdog = homeTeam; underdogOdds = homeOdds;
                        favorite = awayTeam; favoriteOdds = awayOdds;
                    } else if (awayOdds > homeOdds) {
                        underdog = awayTeam; underdogOdds = awayOdds;
                        favorite = homeTeam; favoriteOdds = homeOdds;
                    } else {
                        underdog = null; underdogOdds = homeOdds;
                        favorite = null; favoriteOdds = awayOdds;
                    }
                }
            }

            const originalOddsKey = `original_odds_${game.id}`;
            localStorage.setItem(originalOddsKey, JSON.stringify({ underdog, underdogOdds, favorite, favoriteOdds }));

            return {
                id: game.id,
                homeTeam, awayTeam,
                startTime: new Date(game.commence_time),
                underdog, underdogOdds, favorite, favoriteOdds,
                completed: game.completed || false,
                winner: game.scores
                    ? (Number(game.scores[0].score) > Number(game.scores[1].score) ? game.scores[0].name : game.scores[1].name)
                    : null,
            };
        }).filter(game =>
            game.underdogOdds !== undefined && game.underdogOdds !== null &&
            game.favoriteOdds !== undefined && game.favoriteOdds !== null
        );
    };

    useEffect(() => {
        const cachedProcessedGames = completedGamesData.map(game => {
            const originalOddsKey = `original_odds_${game.id}`;
            const fallbackOdds = JSON.parse(localStorage.getItem(originalOddsKey) || '{}');
            const underdog = game.underdog || fallbackOdds.underdog;
            const underdogOdds = game.underdogOdds || fallbackOdds.underdogOdds;
            const favorite = game.favorite || fallbackOdds.favorite;
            const favoriteOdds = game.favoriteOdds || fallbackOdds.favoriteOdds;
            const isTossup = underdogOdds === favoriteOdds || (!underdogOdds && !favoriteOdds);
            return {
                id: game.id,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                startTime: new Date(game.commence_time),
                completed: true,
                isTossup,
                underdog,
                underdogOdds,
                favorite,
                favoriteOdds,
                winner: Number(game.scores[0].score) > Number(game.scores[1].score) ? game.scores[0].name : game.scores[1].name,
            };
        });

        const completedFromCurrentFetch = games.filter(game => game.completed);
        const allCompletedGames = [...completedFromCurrentFetch.map(game => {
            const originalOddsKey = `original_odds_${game.id}`;
            const storedOriginalOdds = JSON.parse(localStorage.getItem(originalOddsKey) || '{}');
            return { ...game, ...storedOriginalOdds };
        }), ...cachedProcessedGames];

        const filteredGames = allCompletedGames.filter(involvesTournamentTeam);
        const completedGames = filteredGames.filter(game => game.winner);

        const tossups = completedGames
            .filter(game => game.underdogOdds === game.favoriteOdds || game.isTossup)
            .map(game => ({
                ...game,
                isTossup: true,
                pickWon: false,
                potentialProfit: 0
            }));

        const bettingResults = completedGames
            .filter(game => game.underdogOdds !== game.favoriteOdds)
            .map(game => {
                const pickWon = getPickWon(game);
                const pickOdds = getPickOdds(game);
                const potentialProfit = pickWon
                    ? (betAmount * (pickOdds > 0 ? pickOdds / 100 : 100 / Math.abs(pickOdds)))
                    : -betAmount;
                return { ...game, isTossup: false, underdogWon: game.winner === game.underdog, pickWon, potentialProfit };
            });

        setTossupGames(tossups);
        setResults(bettingResults);
        const totalProfitLoss = bettingResults.reduce((sum, game) => sum + game.potentialProfit, 0);
        setProfitLoss(totalProfitLoss);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [games, betAmount, filterByTeams, bettingMode, completedGamesData]);

    const formatOdds = (odds) => {
        if (!odds) return "N/A";
        return odds > 0 ? `+${odds}` : odds;
    };

    const calculatePotentialProfit = (odds, amount) => {
        if (!odds) return 0;
        return odds > 0 ? (amount * odds / 100) : (amount * 100 / Math.abs(odds));
    };

    const getTeamClass = (game, teamName) => {
        if (game.isTossup) {
            return game.winner === teamName ? 'tossup-winner' : '';
        }
        if (game.winner !== teamName) return '';
        const isUnderdogWin = game.underdog === teamName;
        if (isFavoriteMode) {
            return isUnderdogWin ? 'favorite-won' : 'winner';
        }
        return isUnderdogWin ? 'winner' : 'favorite-won';
    };

    if (loading) return <div>Loading data...</div>;
    if (error) return (
        <div className="error">
            <p>{error}</p>
            <button onClick={handleManualRefresh}>Try fetching general basketball odds instead</button>
        </div>
    );

    const upcomingGames = sortGames(
        games.filter(game => !game.completed && game.startTime > new Date()).filter(involvesTournamentTeam),
        sortMethod
    );

    return (
        <div className="underdog-tracker">
            <nav className="strategy-navbar">
                <div className="strategy-navbar-content">
                    <div className="navbar-brand">
                        <h1><strong>dawg 🐶</strong></h1>
                    </div>
                    <div className="stats-navbar">
                        <div className="ticker-track">
                            <div className="stats-wrapper">
                                <div className="stat"><span>Bets:&nbsp; {results.length}</span></div>
                                <div className="stat"><span>Wins:&nbsp; {results.filter(g => g.pickWon).length}</span></div>
                                <div className="stat">
                                    <span>Win Rate:&nbsp; {results.length > 0 ? `${(results.filter(g => g.pickWon).length / results.length * 100).toFixed(1)}%` : "N/A"}</span>
                                </div>
                                <div className="stat"><span>P/L:&nbsp; <span className={profitLoss > 0 ? 'positive-pl' : profitLoss < 0 ? 'negative-pl' : ''}>${profitLoss.toFixed(2)}</span></span></div>
                                <div className="stat"><span>ROI:&nbsp; <span className={results.length > 0 ? (profitLoss / (betAmount * results.length) * 100 < 0 ? 'negative-roi' : 'positive-roi') : ''}>{results.length > 0 ? `${(profitLoss / (betAmount * results.length) * 100).toFixed(1)}%` : "N/A"}</span></span></div>
                            </div>
                            <div className="stats-wrapper stats-wrapper2">
                                <div className="stat"></div>
                                <div className="stat"><span>Bets:&nbsp; {results.length}</span></div>
                                <div className="stat"><span>Wins:&nbsp; {results.filter(g => g.pickWon).length}</span></div>
                                <div className="stat">
                                    <span>Win Rate:&nbsp; {results.length > 0 ? `${(results.filter(g => g.pickWon).length / results.length * 100).toFixed(1)}%` : "N/A"}</span>
                                </div>
                                <div className="stat"><span>P/L:&nbsp; <span className={profitLoss > 0 ? 'positive-pl' : profitLoss < 0 ? 'negative-pl' : ''}>${profitLoss.toFixed(2)}</span></span></div>
                                <div className="stat"><span>ROI:&nbsp; <span className={results.length > 0 ? (profitLoss / (betAmount * results.length) * 100 < 0 ? 'negative-roi' : 'positive-roi') : ''}>{results.length > 0 ? `${(profitLoss / (betAmount * results.length) * 100).toFixed(1)}%` : "N/A"}</span></span></div>
                            </div>
                        </div>
                    </div>

                    <div className="nav-tabs">
                        <div className="nav-tab-wrapper">
                            {showGamesArrow && (
                                <div className="games-arrow-indicator" aria-hidden="true">
                                    <svg
                                        className="games-arrow-svg"
                                        viewBox="0 0 24 32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 30 C12 30, 12 14, 12 12"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M5 18 L12 10 L19 18"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span className="games-arrow-label">start here</span>
                                </div>
                            )}
                            <button
                                className={`nav-tab ${activePage === 'home' ? 'nav-tab--active' : ''} ${showGamesArrow ? 'nav-tab--highlighted' : ''}`}
                                onClick={handleGamesClick}
                            >
                                Games
                            </button>
                        </div>
                        <button
                            className={`nav-tab ${activePage === 'stats' ? 'nav-tab--active' : ''}`}
                            onClick={() => setActivePage('stats')}
                        >
                            Stats
                        </button>
                        <button
                            className={`nav-tab ${activePage === 'about' ? 'nav-tab--active' : ''}`}
                            onClick={() => setActivePage('about')}
                        >
                            About
                        </button>
                    </div>
                </div>
            </nav>

            {activePage === 'about' && <AboutPage />}

            {activePage === 'stats' && (
                <StatsPage
                    results={results}
                    tossupGames={tossupGames}
                    betAmount={betAmount}
                    bettingMode={bettingMode}
                />
            )}

            {activePage === 'home' && (
                <div className="main-content">
                    <div className="settings">
                        <div className="settings-left">
                            <label>
                                Bet Amount: $
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(Number(e.target.value))}
                                    min="1"
                                />
                            </label>
                            <label>
                                <input type="checkbox" checked={showCompleted}
                                       onChange={() => setShowCompleted(!showCompleted)}/>
                                Show Completed Games
                            </label>
                        </div>
                        <button
                            className={`mode-switch-small ${isFavoriteMode ? 'mode-switch-small--favorite' : 'mode-switch-small--underdog'}`}
                            onClick={() => setBettingMode(prev => prev === 'underdog' ? 'favorite' : 'underdog')}
                            title={`Switch to ${isFavoriteMode ? 'underdog' : 'favorite'} mode`}
                        >
                            <span className="mode-switch-small-thumb"/>
                            <span className="mode-switch-small-label">{isFavoriteMode ? '👑 fav' : '🐶 dog'}</span>
                        </button>
                    </div>

                    <div className="sort-options">
                        <label htmlFor="sort-select">Sort by: </label>
                        <select id="sort-select" value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
                            <option value="time">Earliest Games</option>
                            <option value="timeDesc">Latest Games</option>
                            <option value="profit">Highest Profit</option>
                            <option value="profitDesc">Lowest Profit</option>
                        </select>
                    </div>

                    {showCompleted && (
                        <>
                            <h2>Completed Games</h2>
                            {results.length === 0 && tossupGames.length === 0 ? (
                                <p className="empty-state">no completed games yet — check back after tip-off {modeEmoji}</p>
                            ) : (
                                <div className="games-list">
                                    {sortGames([...results, ...tossupGames], sortMethod === 'profit' ? 'profit' : 'timeDesc')
                                        .map(game => (
                                            <div key={game.id}
                                                 className={`game-card completed ${game.isTossup ? 'tossup' : game.pickWon ? 'win' : 'loss'}`}>
                                                <div className="game-time">{game.startTime.toLocaleDateString()}</div>
                                                <div className="matchup">
                                                    <div className={`team ${getTeamClass(game, game.homeTeam)}`}>
                                                        {game.homeTeam}
                                                        {!game.isTossup && (isFavoriteMode
                                                            ? game.favorite === game.homeTeam && ' 👑'
                                                            : game.underdog === game.homeTeam && ' 🐶')}
                                                        <span className="team-odds">
                                                            {formatOdds(game.homeTeam === game.favorite ? game.favoriteOdds : game.underdogOdds)}
                                                        </span>
                                                    </div>
                                                    <div className="vs">vs</div>
                                                    <div className={`team ${getTeamClass(game, game.awayTeam)}`}>
                                                        {game.awayTeam}
                                                        {!game.isTossup && (isFavoriteMode
                                                            ? game.favorite === game.awayTeam && ' 👑'
                                                            : game.underdog === game.awayTeam && ' 🐶')}
                                                        <span className="team-odds">
                                                            {formatOdds(game.awayTeam === game.favorite ? game.favoriteOdds : game.underdogOdds)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="result">
                                                    <span>Result: </span>
                                                    <span className={game.isTossup ? 'tossup-text' : game.pickWon ? 'profit' : 'loss'}>
                                                        {game.isTossup ? "Pick'em" : game.pickWon ? `${modeLabel} Won!` : `${modeLabel} Lost`}
                                                    </span>
                                                </div>
                                                <div className="bet-result">
                                                    <span>Bet Result: </span>
                                                    <span className={game.isTossup ? 'tossup-text' : game.pickWon ? 'profit' : 'loss'}>
                                                        {game.isTossup ? '$0.00' : game.pickWon
                                                            ? `+$${game.potentialProfit.toFixed(2)}`
                                                            : `-$${betAmount.toFixed(2)}`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </>
                    )}

                    <h2>Upcoming Games</h2>
                    {upcomingGames.length === 0 ? (
                        <p>No upcoming games found for tournament teams.</p>
                    ) : (
                        <div className="games-list">
                            {upcomingGames.map(game => {
                                const pickTeam = getPickTeam(game);
                                const pickOdds = getPickOdds(game);
                                const otherOdds = isFavoriteMode ? game.underdogOdds : game.favoriteOdds;
                                const otherLabel = isFavoriteMode ? 'Underdog' : 'Favorite';

                                return (
                                    <div key={game.id} className="game-card">
                                        <div className="game-time">
                                            {game.startTime.toLocaleDateString()} {game.startTime.toLocaleTimeString()}
                                        </div>
                                        <div className="matchup">
                                            <div className={`team ${pickTeam === game.homeTeam ? (isFavoriteMode ? 'favorite' : 'underdog') : (isFavoriteMode ? 'underdog' : 'favorite')}`}>
                                                {game.homeTeam}
                                                {isFavoriteMode
                                                    ? game.favorite === game.homeTeam && ' 👑'
                                                    : game.underdog === game.homeTeam && ' 🐶'}
                                            </div>
                                            <div className="vs">vs</div>
                                            <div className={`team ${pickTeam === game.awayTeam ? (isFavoriteMode ? 'favorite' : 'underdog') : (isFavoriteMode ? 'underdog' : 'favorite')}`}>
                                                {game.awayTeam}
                                                {isFavoriteMode
                                                    ? game.favorite === game.awayTeam && ' 👑'
                                                    : game.underdog === game.awayTeam && ' 🐶'}
                                            </div>
                                        </div>
                                        <div className="odds">
                                            <div>
                                                <span>{modeLabel}: </span>
                                                <span className={isFavoriteMode ? 'favorite-odds' : 'underdog-odds'}>
                                                    {formatOdds(pickOdds)}
                                                </span>
                                            </div>
                                            <div>
                                                <span>{otherLabel}: </span>
                                                <span className={isFavoriteMode ? 'underdog-odds' : 'favorite-odds'}>
                                                    {formatOdds(otherOdds)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="potential-return">
                                            <span>Potential Profit on {modeLabel}: </span>
                                            <span className="profit">
                                                ${calculatePotentialProfit(pickOdds, betAmount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="about-disclaimer">
                        <p>⚠️ dawg is for entertainment and educational purposes only. no real money is involved. gamble responsibly.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnderdogTracker;