// Function to get yesterday's NBA games
export async function getYesterdaysGames() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  console.log("Fetching games for dates:", yesterdayStr, "and", todayStr);

  try {
    // Fetching games for yesterday AND today
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
      }),
    ]);

    const dataYesterday = await responseYesterday.json();
    const dataToday = await responseToday.json();

    // Combining the two responses
    const allGamesData = [...dataYesterday.response, ...dataToday.response];
    console.log("Total games fetched:", allGamesData.length);

    // Creating filtering timestamps (in UTC)
    const yesterdayDate = new Date(yesterdayStr);
    const todayDate = new Date(todayStr);

    const startTime = new Date(yesterdayDate);
    startTime.setUTCHours(18, 0, 0, 0); // 18h UTC yesterday

    const endTime = new Date(todayDate);
    endTime.setUTCHours(6, 0, 0, 0); // 6h UTC today

    console.log(
      "Filtering games between",
      startTime.toISOString(),
      "and",
      endTime.toISOString()
    );

    allGamesData.forEach((game) => {
      const gameTime = new Date(game.date.start);
      console.log(
        "Game:",
        game.teams.visitors.nickname,
        "@",
        game.teams.home.nickname,
        "| start:",
        game.date.start,
        "| gameTime:",
        gameTime.toISOString()
      );
    });

    const games = allGamesData
      .filter((game) => {
        // Checking that there are at least 3 quarters scored for each team
        const linescoreHome = game.scores?.home?.linescore || [];
        const linescoreAway = game.scores?.visitors?.linescore || [];
        const enoughQuarters =
          linescoreHome.filter((q) => q && q !== "").length >= 3 &&
          linescoreAway.filter((q) => q && q !== "").length >= 3;

        if (!enoughQuarters) {
          console.log(
            "Exclu (linescore):",
            game.teams.visitors.nickname,
            "@",
            game.teams.home.nickname,
            "| linescore:",
            linescoreHome,
            linescoreAway
          );
          return false;
        }

        // Checking game time within the specified range
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
          homeScore3Q: homeScoreQ3,
          visitorScore3Q: awayScoreQ3,
          finalHomeScore: game.scores.home.points,
          finalVisitorScore: game.scores.visitors.points,
          status: game.status?.long,
          date: game.date,
          startTime: game.date.start,
        };
      });

    console.log("Fetched filtered games:", games);
    return games;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    return false;
  }
}

// Function to filter close games
export function getCloseGames(games) {
  return games.filter((game) => {
    const diff3Q = Math.abs(game.homeScore3Q - game.visitorScore3Q);
    const isFinal = game.status === "Finished";
    const diffFinal =
      typeof game.finalHomeScore === "number" &&
      typeof game.finalVisitorScore === "number"
        ? Math.abs(game.finalHomeScore - game.finalVisitorScore)
        : null;

    // Criteria 1: after 3Q, score difference < 10
    if (diff3Q < 10) return true;

    // Criteria 2: if final, score difference ≤ 5
    if (isFinal && diffFinal !== null && diffFinal <= 5) return true;

    return false;
  });
}

// Function to get yesterday's close games (combining both functionalities)
export async function getYesterdaysCloseGames() {
  try {
    const allGames = await getYesterdaysGames();
    return getCloseGames(allGames);
  } catch (error) {
    console.error("Erreur dans getYesterdaysCloseGames:", error);
    return false;
  }
}
