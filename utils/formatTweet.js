export function formatTweet(gamesList) {
    const gamesFormat = gamesList.map((game) => {
        return `${game.visitorTeam} @ ${game.homeTeam}`;
    });
    
    if (gamesList.length === 0) {
        return "Good morning Europe! No close NBA games from last night. Have a great day! 🏀";
    }
    
    if (gamesFormat.length === 1) {
        return `Good morning Europe! Yesterday's close game was: ${gamesFormat[0]}. Stay tuned for more updates!`;
    }
    
    const allButLast = gamesFormat.slice(0, -1);
    const lastGame = gamesFormat[gamesFormat.length - 1];

    return `Good morning Europe! Yesterday's close games were: ${allButLast.join(", ")} and ${lastGame}. Stay tuned for more updates!`;
}