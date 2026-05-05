export function AdminPage() {
  const refresh = async (league: string) => {
    const res = await fetch(`/api/cron-monitor?league=${league}`);
    const data = await res.json();

    console.log(data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <button onClick={() => refresh('PL')}>Refresh PL</button>
      <br />
      <button onClick={() => refresh('PD')}>Refresh La Liga</button>
      <br />
      <button onClick={() => refresh('BL1')}>Refresh Bundesliga</button>
      <br />
      <button onClick={() => refresh('SA')}>Refresh Serie A</button>
      <br />
      <button onClick={() => refresh('FL1')}>Refresh Ligue 1</button>
    </div>
  );
}