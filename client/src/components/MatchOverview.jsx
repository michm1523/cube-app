import "../css/MatchOverview.css";

function MatchOverview({ back, playerTime, opponentTime }) {
  return (
    <div className="match-overview">
      <h1>Match Overview</h1>
      <p>Player Time: {playerTime}</p>
      <p>Opponent Time: {opponentTime}</p>
      <button onClick={back}>Back to Lobby</button>
    </div>
  );
}

export default MatchOverview;
