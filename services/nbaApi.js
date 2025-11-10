// Function to get yesterday's NBA games
export async function getYesterdaysGames() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  console.log("Fetching games for dates:", yesterdayStr, "and", todayStr);

  try {
    // Récupérer les matchs d'hier ET d'aujourd'hui
    const [responseYesterday, responseToday] = await Promise.all([
      fetch(`https://v2.nba.api-sports.io/games?date=${yesterdayStr}`, {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "v2.nba.api-sports.io",
        },
      }),
      fetch(`https://v2.nba.api-sports.io/games?date=${todayStr}`, {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "v2.nba.api-sports.io",
        },
      })
    ]);

    const dataYesterday = await responseYesterday.json();
    const dataToday = await responseToday.json();

    // Combiner les deux réponses
    const allGamesData = [...dataYesterday.response, ...dataToday.response];

    // Créer les timestamps de filtrage (en UTC)
    const yesterdayDate = new Date(yesterdayStr);
    const todayDate = new Date(todayStr);
    
    const startTime = new Date(yesterdayDate);
    startTime.setUTCHours(18, 0, 0, 0); // 18h UTC la veille
    
    const endTime = new Date(todayDate);
    endTime.setUTCHours(6, 0, 0, 0); // 6h UTC aujourd'hui

    console.log("Filtering games between", startTime.toISOString(), "and", endTime.toISOString());

    const games = allGamesData
      .filter((game) => {
        // Vérifier que le match a au moins 3 quarts-temps
        if (!game.periods || game.periods.current < 4) return false;

        // Vérifier que le match est dans la plage horaire
        const gameTime = new Date(game.date.start);
        return gameTime >= startTime && gameTime <= endTime;
      })
      .map((game) => {
        const homeScoreQ3 =
          parseInt(game.scores.home.linescore[0] || 0) +
          parseInt(game.scores.home.linescore[1] || 0) +
          parseInt(game.scores.home.linescore[2] || 0);

        const awayScoreQ3 =
          parseInt(game.scores.visitors.linescore[0] || 0) +
          parseInt(game.scores.visitors.linescore[1] || 0) +
          parseInt(game.scores.visitors.linescore[2] || 0);

        return {
          id: game.id,
          homeTeam: game.teams.home.nickname,
          visitorTeam: game.teams.visitors.nickname,
          homeScore: homeScoreQ3,
          visitorScore: awayScoreQ3,
          date: game.date,
          startTime: game.date.start,
        };
      });

    console.log("Fetched filtered games:", games);
    return games;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    throw error;
  }
}

// Function to filter close games
export function getCloseGames(games, maxPointDifference = 9) {
  return games.filter((game) => {
    return Math.abs(game.homeScore - game.visitorScore) <= maxPointDifference;
  });
}

// Function to get yesterday's close games (combining both functionalities)
export async function getYesterdaysCloseGames(maxPointDifference = 9) {
  const allGames = await getYesterdaysGames();
  return getCloseGames(allGames, maxPointDifference);
}
