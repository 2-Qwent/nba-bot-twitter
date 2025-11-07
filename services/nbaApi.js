import { BalldontlieAPI } from "@balldontlie/sdk";

function getNBAApi() {
  return new BalldontlieAPI({ apiKey: process.env.NBA_API_KEY });
}

// Function to get yesterday's NBA games
export async function getYesterdaysGames() {
  const api = getNBAApi();
  const now = new Date();
  
  // Si on est avant 9h du matin (CET), les matchs de "hier" sont encore sur la date d'hier UTC
  // Si on est après 9h, les matchs sont sur la date d'aujourd'hui UTC
  const targetDate = new Date();
  
  // Si l'heure est avant 9h CET, on prend hier
  // Sinon on prend aujourd'hui (car matchs commencés après minuit UTC = aujourd'hui en UTC)
  if (now.getHours() < 9) {
    targetDate.setDate(targetDate.getDate() - 1);
  }
  
  const dateStr = targetDate.toISOString().split("T")[0];

  try {
    const response = await fetch(
      `https://v2.nba.api-sports.io/games?date=${dateStr}`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "v2.nba.api-sports.io",
        },
      }
    );

    const data = await response.json();

    const games = data.response.map((game) => {
      const homeScoreQ3 =
        parseInt(game.scores.home.linescore[0]) +
        parseInt(game.scores.home.linescore[1]) +
        parseInt(game.scores.home.linescore[2]);

      const awayScoreQ3 =
        parseInt(game.scores.visitors.linescore[0]) +
        parseInt(game.scores.visitors.linescore[1]) +
        parseInt(game.scores.visitors.linescore[2]);
      return {
        id: game.id,
        homeTeam: game.teams.home.name,
        visitorTeam: game.teams.visitors.name,
        homeScore: homeScoreQ3,
        visitorScore: awayScoreQ3,
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
