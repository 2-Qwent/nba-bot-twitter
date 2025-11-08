import { BalldontlieAPI } from "@balldontlie/sdk";

function getNBAApi() {
  return new BalldontlieAPI({ apiKey: process.env.NBA_API_KEY });
}

// Function to get yesterday's NBA games
export async function getYesterdaysGames() {
  const api = getNBAApi();

  // const yesterday = new Date();
  // yesterday.setDate(yesterday.getDate() - 1);
  // const yesterdayStr = yesterday.toISOString().split("T")[0];

  const now = new Date();
  const nowStr = now.toISOString().split("T")[0];

  console.log("Fetching games for date:", nowStr);

  try {
    const response = await fetch(
      `https://v2.nba.api-sports.io/games?date=${nowStr}`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "v2.nba.api-sports.io",
        },
      }
    );

    const data = await response.json();

    const games = data.response
      .filter((game) => {
        // Garder seulement les matchs avec au moins 3 quarts-temps terminés
        return game.periods && game.periods.current >= 4;
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
          homeTeam: game.teams.home.name,
          visitorTeam: game.teams.visitors.name,
          homeScore: homeScoreQ3,
          visitorScore: awayScoreQ3,
          date: game.date,
        };
      });
    console.log("Fetched games:", games);
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
