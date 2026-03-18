import React, { useState, useEffect } from 'react';
import './dawg.css'

const UnderdogTracker = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [profitLoss, setProfitLoss] = useState(0);
    const [betAmount, setBetAmount] = useState(100);
    const [showCompleted, setShowCompleted] = useState(true);
    const [sortMethod, setSortMethod] = useState('time');
    const [filterByTeams, setFilterByTeams] = useState(true);
    const [bettingMode, setBettingMode] = useState('underdog');
    const [tossupGames, setTossupGames] = useState([]);

    const CACHE_TIME_KEY = "underdogCacheTime";
    const COMPLETED_GAMES_CACHE_KEY = "underdogCompletedGamesCache";

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
        "Texas/NC State": "NC State Wolfpack",
        "Gonzaga": "Gonzaga Bulldogs",
        "Kennesaw State": "Kennesaw St Owls",
        "Miami": "Miami Hurricanes",
        "Missouri": "Missouri Tigers",
        "Purdue": "Purdue Boilermakers",
        "Queens": "Queens University Royals",
        "Florida": "Florida Gators",
        "Prairie View/Lehigh": "Prairie View Panthers",
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
        "UMBC/Howard": "Howard Bison",
        "Georgia": "Georgia Bulldogs",
        "Saint Louis": "Saint Louis Billikens",
        "Texas Tech": "Texas Tech Red Raiders",
        "Akron": "Akron Zips",
        "Alabama": "Alabama Crimson Tide",
        "Hofstra": "Hofstra Pride",
        "Tennessee": "Tennessee Volunteers",
        "Miami (Ohio)/SMU": "SMU Mustangs",
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

    const fetchOddsForSport = async () => {
        try {
            setLoading(true);
            const response = await fetch('/odds.json');
            const oddsData = await response.json();

            const scoresResponse = await fetch('/scores.json');
            const scoresData = await scoresResponse.json();

            const cachedCompletedGames = JSON.parse(localStorage.getItem(COMPLETED_GAMES_CACHE_KEY) || '[]');
            const newCompletedGames = scoresData.filter(score =>
                score.completed && score.scores &&
                !cachedCompletedGames.some(cached => cached.id === score.id)
            );
            const mergedCompletedGames = [...cachedCompletedGames, ...newCompletedGames];
            localStorage.setItem(COMPLETED_GAMES_CACHE_KEY, JSON.stringify(mergedCompletedGames));

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
            const isTossup = originalOdds.underdogOdds === originalOdds.favoriteOdds;
            return {
                id: game.id,
                homeTeam: game.home_team,
                awayTeam: game.away_team,
                startTime: new Date(game.commence_time),
                completed: true,
                isTossup, //
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
                                {sortGames([...results, ...tossupGames], sortMethod === 'profit' ? 'profit' : 'timeDesc')
                                    .map(game => (
                                        <div key={game.id}
                                             className={`game-card completed ${game.isTossup ? 'tossup' : game.pickWon ? 'win' : 'loss'}`}>
                                            <div className="game-time">{game.startTime.toLocaleDateString()}</div>
                                            <div className="matchup">
                                                <div
                                                    className={`team ${game.winner === game.homeTeam ? 'winner' : ''}`}>
                                                    {game.homeTeam}
                                                    {isFavoriteMode
                                                        ? game.favorite === game.homeTeam && ' 👑'
                                                        : game.underdog === game.homeTeam && ' 🐶'}
                                                    <span className="team-odds">
                                                        {formatOdds(game.homeTeam === game.favorite ? game.favoriteOdds : game.underdogOdds)}
                                                    </span>
                                                </div>
                                                <div className="vs">vs</div>
                                                <div
                                                    className={`team ${game.winner === game.awayTeam ? 'winner' : ''}`}>
                                                    {game.awayTeam}
                                                    {isFavoriteMode
                                                        ? game.favorite === game.awayTeam && ' 👑'
                                                        : game.underdog === game.awayTeam && ' 🐶'}
                                                    <span className="team-odds">
                                                        {formatOdds(game.awayTeam === game.favorite ? game.favoriteOdds : game.underdogOdds)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="result">
                                                <span>Result: </span>
                                                <span
                                                    className={game.isTossup ? 'tossup-text' : game.pickWon ? 'profit' : 'loss'}>
                                                    {game.isTossup ? "Pick'em" : game.pickWon ? `${modeLabel} Won!` : `${modeLabel} Lost`}
                                                </span>
                                            </div>
                                            <div className="bet-result">
                                                <span>Bet Result: </span>
                                                <span
                                                    className={game.isTossup ? 'tossup-text' : game.pickWon ? 'profit' : 'loss'}>
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