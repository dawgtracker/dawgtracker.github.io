import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dawg.css'

const UnderdogTracker = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [profitLoss, setProfitLoss] = useState(0);
    const [betAmount, setBetAmount] = useState(100);
    const [showCompleted, setShowCompleted] = useState(true);
    const [availableSports, setAvailableSports] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('Unknown');
    const [sortMethod, setSortMethod] = useState('time');
    const [filterByTeams, setFilterByTeams] = useState(true);
    const [bettingMode, setBettingMode] = useState('underdog');

    const API_KEY = process.env.REACT_APP_API_KEY;
    const BASE_URL = "https://api.the-odds-api.com/v4";

    const SPORTS_CACHE_KEY = "underdogSportsCache";
    const ODDS_CACHE_KEY = "underdogOddsCache";
    const CACHE_TIME_KEY = "underdogCacheTime";
    const COMPLETED_GAMES_CACHE_KEY = "underdogCompletedGamesCache";

    const isFavoriteMode = bettingMode === 'favorite';
    const modeLabel = isFavoriteMode ? 'Favorite' : 'Underdog';
    const modeEmoji = isFavoriteMode ? '👑' : '🐶';

    const getPickTeam = (game) => isFavoriteMode ? game.favorite : game.underdog;
    const getPickOdds = (game) => isFavoriteMode ? game.favoriteOdds : game.underdogOdds;
    const getPickWon = (game) => game.winner === getPickTeam(game);

    const initialTeams = {
        east: [
            { seed: 1, name: "Duke", score: null },
            { seed: 16, name: "Siena", score: null },
            { seed: 8, name: "Ohio State", score: null },
            { seed: 9, name: "TCU", score: null },
            { seed: 5, name: "St. John's", score: null },
            { seed: 12, name: "Northern Iowa", score: null },
            { seed: 4, name: "Kansas", score: null },
            { seed: 13, name: "Cal Baptist", score: null },
            { seed: 6, name: "Louisville", score: null },
            { seed: 11, name: "South Florida", score: null },
            { seed: 3, name: "Michigan State", score: null },
            { seed: 14, name: "North Dakota State", score: null },
            { seed: 7, name: "UCLA", score: null },
            { seed: 10, name: "UCF", score: null },
            { seed: 2, name: "UConn", score: null },
            { seed: 15, name: "Furman", score: null },
        ],
        west: [
            { seed: 1, name: "Arizona", score: null },
            { seed: 16, name: "Long Island", score: null },
            { seed: 8, name: "Villanova", score: null },
            { seed: 9, name: "Utah State", score: null },
            { seed: 5, name: "Wisconsin", score: null },
            { seed: 12, name: "High Point", score: null },
            { seed: 4, name: "Arkansas", score: null },
            { seed: 13, name: "Hawaii", score: null },
            { seed: 6, name: "BYU", score: null },
            { seed: 11, name: "Texas/NC State", score: null },
            { seed: 3, name: "Gonzaga", score: null },
            { seed: 14, name: "Kennesaw State", score: null },
            { seed: 7, name: "Miami", score: null },
            { seed: 10, name: "Missouri", score: null },
            { seed: 2, name: "Purdue", score: null },
            { seed: 15, name: "Queens", score: null },
        ],
        south: [
            { seed: 1, name: "Florida", score: null },
            { seed: 16, name: "Prairie View/Lehigh", score: null },
            { seed: 8, name: "Clemson", score: null },
            { seed: 9, name: "Iowa", score: null },
            { seed: 5, name: "Vanderbilt", score: null },
            { seed: 12, name: "McNeese", score: null },
            { seed: 4, name: "Nebraska", score: null },
            { seed: 13, name: "Troy", score: null },
            { seed: 6, name: "North Carolina", score: null },
            { seed: 11, name: "VCU", score: null },
            { seed: 3, name: "Illinois", score: null },
            { seed: 14, name: "Penn", score: null },
            { seed: 7, name: "Saint Mary's", score: null },
            { seed: 10, name: "Texas A&M", score: null },
            { seed: 2, name: "Houston", score: null },
            { seed: 15, name: "Idaho", score: null },
        ],
        midwest: [
            { seed: 1, name: "Michigan", score: null },
            { seed: 16, name: "UMBC/Howard", score: null },
            { seed: 8, name: "Georgia", score: null },
            { seed: 9, name: "Saint Louis", score: null },
            { seed: 5, name: "Texas Tech", score: null },
            { seed: 12, name: "Akron", score: null },
            { seed: 4, name: "Alabama", score: null },
            { seed: 13, name: "Hofstra", score: null },
            { seed: 6, name: "Tennessee", score: null },
            { seed: 11, name: "Miami (Ohio)/SMU", score: null },
            { seed: 3, name: "Virginia", score: null },
            { seed: 14, name: "Wright State", score: null },
            { seed: 7, name: "Kentucky", score: null },
            { seed: 10, name: "Santa Clara", score: null },
            { seed: 2, name: "Iowa State", score: null },
            { seed: 15, name: "Tennessee State", score: null },
        ]
    };

    const getAllTeamNames = () => {
        let allTeams = [];
        Object.values(initialTeams).forEach(region => {
            region.forEach(team => {
                if (team.name.includes('/')) {
                    const splitTeams = team.name.split('/');
                    splitTeams.forEach(splitTeam => allTeams.push(splitTeam.trim()));
                } else {
                    allTeams.push(team.name);
                }
            });
        });
        return allTeams;
    };

    const handleManualRefresh = () => {
        localStorage.removeItem(SPORTS_CACHE_KEY);
        localStorage.removeItem(ODDS_CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);
        setLoading(true);
        setError(null);
        fetchSports();
    };

    const bracketTeams = getAllTeamNames();

    const involvesTournamentTeam = (game) => {
        if (!filterByTeams) return true;
        const homeTeamMatch = bracketTeams.some(team =>
            game.homeTeam?.includes(team) || team.includes(game.homeTeam)
        );
        const awayTeamMatch = bracketTeams.some(team =>
            game.awayTeam?.includes(team) || team.includes(game.awayTeam)
        );
        return homeTeamMatch || awayTeamMatch;
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

    const shouldRefreshData = () => {
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
        const today = new Date().toDateString();
        return !cacheTime || cacheTime !== today;
    };

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const cachedSports = localStorage.getItem(SPORTS_CACHE_KEY);
                const cachedOdds = localStorage.getItem(ODDS_CACHE_KEY);
                const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
                setLastUpdated(cacheTime || 'Unknown');

                if (cachedSports && cachedOdds && !shouldRefreshData()) {
                    setAvailableSports(JSON.parse(cachedSports));
                    processCachedOdds(JSON.parse(cachedOdds));
                    return;
                }

                const response = await axios.get(`${BASE_URL}/sports`, {
                    params: { apiKey: API_KEY }
                });
                const sportsData = response.data;
                setAvailableSports(sportsData);
                localStorage.setItem(SPORTS_CACHE_KEY, JSON.stringify(sportsData));

                const ncaaBasketballSports = sportsData.filter(
                    sport => sport.key === "basketball_ncaab"
                );

                if (ncaaBasketballSports.length > 0) {
                    fetchOddsForSport("basketball_ncaab");
                } else {
                    setError('Could not find NCAA basketball in available sports. Available sports: ' +
                        sportsData.map(s => s.key).join(', '));
                    setLoading(false);
                }
            } catch (err) {
                setError('Error fetching available sports: ' + err.message);
                setLoading(false);
            }
        };

        fetchSports();

        const checkForRefresh = () => {
            if (shouldRefreshData()) {
                localStorage.removeItem(SPORTS_CACHE_KEY);
                localStorage.removeItem(ODDS_CACHE_KEY);
                localStorage.removeItem(CACHE_TIME_KEY);
                fetchSports();
            }
        };

        const intervalId = setInterval(checkForRefresh, 600000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const scheduleNextRefresh = () => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(1, 30, 32, 0);
            const timeUntilRefresh = tomorrow - now;

            const timeoutId = setTimeout(() => {
                localStorage.removeItem(SPORTS_CACHE_KEY);
                localStorage.removeItem(ODDS_CACHE_KEY);
                localStorage.removeItem(CACHE_TIME_KEY);
                fetchSports();
                scheduleNextRefresh();
            }, timeUntilRefresh);

            return timeoutId;
        };

        const timeoutId = scheduleNextRefresh();
        return () => clearTimeout(timeoutId);
    }, []);

    const processCachedOdds = (oddsData) => {
        const processedGames = processGamesData(oddsData);
        setGames(processedGames);
        setLoading(false);
    };

    const fetchSports = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/sports`, {
                params: { apiKey: API_KEY }
            });
            const sportsData = response.data;
            setAvailableSports(sportsData);
            localStorage.setItem(SPORTS_CACHE_KEY, JSON.stringify(sportsData));

            const ncaaBasketballSports = sportsData.filter(sport =>
                sport.key.includes('basketball') &&
                (sport.key.includes('ncaa') || sport.key.includes('college'))
            );

            if (ncaaBasketballSports.length > 0) {
                fetchOddsForSport(ncaaBasketballSports[0].key);
            } else {
                setError('Could not find NCAA basketball in available sports.');
                setLoading(false);
            }
        } catch (err) {
            setError('Error fetching available sports: ' + err.message);
            setLoading(false);
        }
    };

    const fetchOddsForSport = async (sportKey) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/sports/${sportKey}/odds`, {
                params: {
                    apiKey: API_KEY,
                    regions: 'us',
                    markets: 'h2h,spreads',
                    oddsFormat: 'american'
                }
            });

            const scoresResponse = await axios.get(`${BASE_URL}/sports/${sportKey}/scores`, {
                params: { apiKey: API_KEY, daysFrom: 1 }
            });

            const cachedCompletedGames = JSON.parse(localStorage.getItem(COMPLETED_GAMES_CACHE_KEY) || '[]');
            const newCompletedGames = scoresResponse.data.filter(score =>
                score.completed && score.scores &&
                !cachedCompletedGames.some(cached => cached.id === score.id)
            );
            const mergedCompletedGames = [...cachedCompletedGames, ...newCompletedGames];
            localStorage.setItem(COMPLETED_GAMES_CACHE_KEY, JSON.stringify(mergedCompletedGames));
            localStorage.setItem(ODDS_CACHE_KEY, JSON.stringify(response.data));

            const currentDate = new Date().toDateString();
            localStorage.setItem(CACHE_TIME_KEY, currentDate);
            setLastUpdated(currentDate);

            const processedGames = processGamesData(response.data);
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
            const bookmaker = game.bookmakers?.[0];

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
                    } else {
                        underdog = awayTeam; underdogOdds = awayOdds;
                        favorite = homeTeam; favoriteOdds = homeOdds;
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
                    ? (game.scores[0].score > game.scores[1].score ? game.scores[0].name : game.scores[1].name)
                    : null,
            };
        }).filter(game =>
            game.underdogOdds !== undefined && game.underdogOdds !== null &&
            game.favoriteOdds !== undefined && game.favoriteOdds !== null
        );
    };

    useEffect(() => {
        const cachedCompletedGames = JSON.parse(localStorage.getItem(COMPLETED_GAMES_CACHE_KEY) || '[]');

        const cachedProcessedGames = cachedCompletedGames.map(game => {
            const originalOddsKey = `original_odds_${game.id}`;
            const originalOdds = JSON.parse(localStorage.getItem(originalOddsKey) || '{}');
            return {
                id: game.id,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                startTime: new Date(game.commence_time),
                completed: true,
                winner: game.scores[0].score > game.scores[1].score ? game.scores[0].name : game.scores[1].name,
                ...originalOdds
            };
        });

        const completedFromCurrentFetch = games.filter(game => game.completed);
        const allCompletedGames = [
            ...completedFromCurrentFetch.map(game => {
                const originalOddsKey = `original_odds_${game.id}`;
                const storedOriginalOdds = JSON.parse(localStorage.getItem(originalOddsKey) || '{}');
                return { ...game, ...storedOriginalOdds };
            }),
            ...cachedProcessedGames
        ];

        const filteredGames = allCompletedGames.filter(involvesTournamentTeam);
        const completedGames = filteredGames.filter(game => game.winner);

        const bettingResults = completedGames.map(game => {
            const pickWon = getPickWon(game);
            const pickOdds = getPickOdds(game);
            const potentialProfit = pickWon
                ? (betAmount * (pickOdds > 0 ? pickOdds / 100 : 100 / Math.abs(pickOdds)))
                : -betAmount;

            return { ...game, underdogWon: game.winner === game.underdog, pickWon, potentialProfit };
        });

        setResults(bettingResults);
        const totalProfitLoss = bettingResults.reduce((sum, game) => sum + game.potentialProfit, 0);
        setProfitLoss(totalProfitLoss);
    }, [games, betAmount, filterByTeams, bettingMode]);

    const formatOdds = (odds) => {
        if (!odds) return "N/A";
        return odds > 0 ? `+${odds}` : odds;
    };

    const calculatePotentialProfit = (odds, amount) => {
        if (!odds) return 0;
        return odds > 0 ? (amount * odds / 100) : (amount * 100 / Math.abs(odds));
    };

    if (loading) return <div>Loading data...</div>;
    if (error) return (
        <div className="error">
            <p>{error}</p>
            <p>Available sports: {(availableSports || []).map(s => s.key).join(', ')}</p>
            <button onClick={handleManualRefresh}>Try fetching general basketball odds instead</button>
        </div>
    );

    const upcomingGames = sortGames(
        games.filter(game => !game.completed).filter(involvesTournamentTeam),
        sortMethod
    );

    if (upcomingGames.length === 0 && results.length === 0) {
        return (
            <div className="underdog-tracker">
                <h1>dawg</h1>
                <div className="error">
                    <p>No tournament games data available.</p>
                    <div className="settings">
                        <label>
                            <input type="checkbox" checked={filterByTeams} onChange={() => setFilterByTeams(!filterByTeams)} />
                            Filter by March Madness
                        </label>
                    </div>
                </div>
            </div>
        );
    }

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
                                <div className="stat"><span>Wins:&nbsp; {results.filter(g => g.pickWon).length}</span>
                                </div>
                                <div className="stat">
                                    <span>Win Rate:&nbsp; {results.length > 0 ? `${(results.filter(g => g.pickWon).length / results.length * 100).toFixed(1)}%` : "N/A"}</span>
                                </div>
                                <div className="stat"><span>P/L:&nbsp; <span
                                    className={profitLoss > 0 ? 'positive-pl' : profitLoss < 0 ? 'negative-pl' : ''}>${profitLoss.toFixed(2)}</span></span>
                                </div>
                                <div className="stat"><span>ROI:&nbsp; <span
                                    className={results.length > 0 ? (profitLoss / (betAmount * results.length) * 100 < 0 ? 'negative-roi' : 'positive-roi') : ''}>{results.length > 0 ? `${(profitLoss / (betAmount * results.length) * 100).toFixed(1)}%` : "N/A"}</span></span>
                                </div>
                            </div>
                            <div className="stats-wrapper stats-wrapper2">
                                <div className="stat"></div>
                                <div className="stat"><span>Bets:&nbsp; {results.length}</span></div>
                                <div className="stat"><span>Wins:&nbsp; {results.filter(g => g.pickWon).length}</span>
                                </div>
                                <div className="stat">
                                    <span>Win Rate:&nbsp; {results.length > 0 ? `${(results.filter(g => g.pickWon).length / results.length * 100).toFixed(1)}%` : "N/A"}</span>
                                </div>
                                <div className="stat"><span>P/L:&nbsp; <span
                                    className={profitLoss > 0 ? 'positive-pl' : profitLoss < 0 ? 'negative-pl' : ''}>${profitLoss.toFixed(2)}</span></span>
                                </div>
                                <div className="stat"><span>ROI:&nbsp; <span
                                    className={results.length > 0 ? (profitLoss / (betAmount * results.length) * 100 < 0 ? 'negative-roi' : 'positive-roi') : ''}>{results.length > 0 ? `${(profitLoss / (betAmount * results.length) * 100).toFixed(1)}%` : "N/A"}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="data-info">
                        <span>Updated: {localStorage.getItem(CACHE_TIME_KEY) ? `${localStorage.getItem(CACHE_TIME_KEY)} 1:30 AM` : 'Unknown'}</span>
                    </div>
                </div>
            </nav>

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
                        <h2>Completed Games {filterByTeams ? '(March Madness)' : ''}</h2>
                        {results.length === 0 ? (
                            <p className="empty-state">no completed games yet — check back after tip-off {modeEmoji}</p>
                        ) : (
                            <div className="games-list">
                                {sortGames(results, sortMethod === 'profit' ? 'profit' : 'timeDesc')
                                    .map(game => (
                                        <div key={game.id} className={`game-card completed ${game.pickWon ? 'win' : 'loss'}`}>
                                            <div className="game-time">{game.startTime.toLocaleDateString()}</div>
                                            <div className="matchup">
                                                <div className={`team ${game.winner === game.homeTeam ? 'winner' : ''}`}>
                                                    {game.homeTeam}
                                                    {isFavoriteMode
                                                        ? game.favorite === game.homeTeam && ' 👑'
                                                        : game.underdog === game.homeTeam && ' 🐶'}
                                                </div>
                                                <div className="vs">vs</div>
                                                <div className={`team ${game.winner === game.awayTeam ? 'winner' : ''}`}>
                                                    {game.awayTeam}
                                                    {isFavoriteMode
                                                        ? game.favorite === game.awayTeam && ' 👑'
                                                        : game.underdog === game.awayTeam && ' 🐶'}
                                                </div>
                                            </div>
                                            <div className="result">
                                                <span>Result: </span>
                                                <span className={game.pickWon ? 'profit' : 'loss'}>
                                                    {game.pickWon ? `${modeLabel} Won!` : `${modeLabel} Lost`}
                                                </span>
                                            </div>
                                            <div className="bet-result">
                                                <span>Bet Result: </span>
                                                <span className={game.pickWon ? 'profit' : 'loss'}>
                                                    {game.pickWon
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

                <h2>Upcoming Games {filterByTeams ? '(March Madness)' : ''}</h2>
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
            </div>
        </div>
    );
};

export default UnderdogTracker;