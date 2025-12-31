import { callAI } from '../utils/ai';

export default function Dashboard() {
  const runAI = async () => {
    alert(await callAI("Analyze my portfolio performance"));
  };

  return (
    <div>
      <h1>TrustraCapitalFx Dashboard</h1>
      <button onClick={runAI}>AI Portfolio Insight</button>
    </div>
  );
}
