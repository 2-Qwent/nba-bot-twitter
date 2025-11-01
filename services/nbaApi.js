import { BalldontlieAPI } from "@balldontlie/sdk";

function getNBAApi() {
  return new BalldontlieAPI({ apiKey: process.env.NBA_API_KEY });
}

// Function to get yesterday's NBA games
export async function getYesterdaysGames() {
  const api = getNBAApi();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  try {
    const response = await api.nba.getGames({
      dates: [yesterdayStr],
    });

    const games = response.data.map((game) => {
      return {
        id: game.id,
        homeTeam: game.home_team.name,
        visitorTeam: game.visitor_team.name,
        homeScore: game.home_team_score,
        visitorScore: game.visitor_team_score,
        status: game.status,
        date: game.date,
      };
    });

    return games;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    throw error;
  }
}

// Function to filter close games
export function getCloseGames(games, maxPointDifference = 5) {
  return games.filter((game) => {
    return Math.abs(game.homeScore - game.visitorScore) <= maxPointDifference;
  });
}

// Function to get yesterday's close games (combining both functionalities)
export async function getYesterdaysCloseGames(maxPointDifference = 5) {
  const allGames = await getYesterdaysGames();
  return getCloseGames(allGames, maxPointDifference);
}
