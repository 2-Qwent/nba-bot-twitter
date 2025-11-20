export function formatTweet(gamesList) {
    const gamesFormat = gamesList.map((game) => {
        return `${game.visitorTeam} @ ${game.homeTeam}`;
    });
    
    if (gamesList.length === 0) {
        return "Good morning Europe! No close games (criterias in bio) from last night. Have a great day! 🏀";
    }
    
    if (gamesFormat.length === 1) {
        return `Good morning Europe! Only one close game (criterias in bio) last night: ${gamesFormat[0]}.\n\nEnjoy the game! 🍿`;
    }
    
    const games = gamesFormat.map(game => `🏀 ${game}`).join("\n");

    return `Good morning Europe! Last night's close games (criterias in bio):\n\n${games}\n\nPick your favorite!`;
}