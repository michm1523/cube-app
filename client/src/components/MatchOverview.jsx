import "../css/MatchOverview.css";

function MatchOverview({
  back,
  playerTime,
  opponentTime,
  playerMoveCount,
  opponentMoveCount,
}) {
  return (
    <div className="match-overview">
      <h1>Match Overview</h1>
      <table>
        <tr>
          <th></th>
          <th>You</th>
          <th>Opponent</th>
        </tr>

        <tr>
          <th>Time</th>
          <td>{playerTime}</td>
          <td>{opponentTime}</td>
        </tr>
        <tr>
          <th>Moves</th>
          <td>{playerMoveCount}</td>
          <td>{opponentMoveCount}</td>
        </tr>
        <tr>
          <th>TPS</th>
          <td>{(playerMoveCount / playerTime).toFixed(1)}</td>
          <td>{(opponentMoveCount / opponentTime).toFixed(1)}</td>
        </tr>
      </table>

      <button onClick={back} className="match-overview-btn">
        Return to lobby
      </button>
    </div>
  );
}

export default MatchOverview;
