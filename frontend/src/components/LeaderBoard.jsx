import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { API_URL } from "../config.js";

function formatInr(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function formatPct(value) {
  return value === null || value === undefined ? "—" : `${value.toFixed(0)}%`;
}

function initials(name) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = ["#0d6efd", "#6f42c1", "#20c997", "#fd7e14", "#dc3545", "#0dcaf0", "#6610f2"];
function avatarColor(name) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function RepAvatar({ name, size = 40 }) {
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-semibold flex-shrink-0"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.35 }}
    >
      {initials(name)}
    </div>
  );
}

function RankMedal({ rank }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) return <span style={{ fontSize: "1.3rem" }}>{medals[rank]}</span>;
  return <span className="text-muted fw-semibold">#{rank}</span>;
}

function RepRow({ rep, variant }) {
  return (
    <Link
      to={`/sales-reps/${rep.rep_id}`}
      className="d-flex align-items-center gap-3 p-2 rounded text-decoration-none text-body border-bottom"
    >
      <div style={{ width: 32 }} className="text-center"><RankMedal rank={rep.rank} /></div>
      <RepAvatar name={rep.name} />
      <div className="flex-grow-1 min-width-0">
        <div className="fw-medium">{rep.name}</div>
        <div className="text-muted small">{rep.branch_name} · {rep.role}</div>
      </div>
      <div className="text-end">
        <div className={`fw-semibold ${variant === "danger" ? "text-danger" : "text-success"}`}>
          {formatInr(rep.revenue)}
        </div>
        <div className="text-muted small">{formatPct(rep.conversion_rate_pct)} conv · {rep.total_leads} leads</div>
      </div>
    </Link>
  );
}

const EMPTY_STATE = { top_reps: [], bottom_reps: [], branch_ranking: [] };

function LeaderBoard() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}api/leaderboard`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { top_reps, bottom_reps, branch_ranking } = data;

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest leaderboard data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        <h1 className="h4 mb-1">Leaderboard</h1>
        <p className="text-muted small mb-0">Ranked by revenue, Jun – Dec 2025</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">🏆 Top 10 performers</h3>
            {top_reps.length === 0 ? (
              <div className="text-muted text-center py-4">{loading ? "Loading…" : "No rep data yet."}</div>
            ) : (
              <div>{top_reps.map((r) => <RepRow key={r.rep_id} rep={r} variant="success" />)}</div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">⚠ Needs support (bottom 5)</h3>
            {bottom_reps.length === 0 ? (
              <div className="text-muted text-center py-4">{loading ? "Loading…" : "Not enough data yet."}</div>
            ) : (
              <div>{bottom_reps.map((r) => <RepRow key={r.rep_id} rep={r} variant="danger" />)}</div>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Branch ranking (by target attainment)</h3>
        {branch_ranking.length === 0 ? (
          <div className="text-muted text-center py-5">{loading ? "Loading…" : "No branch data yet."}</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(branch_ranking.length * 55, 220)}>
              <BarChart data={branch_ranking} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} unit="%" />
                <YAxis type="category" dataKey="name" fontSize={13} width={110} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="attainment_pct" radius={[0, 6, 6, 0]} barSize={28}>
                  {branch_ranking.map((b, i) => (
                    <Cell key={i} fill={b.attainment_pct >= 90 ? "#198754" : b.attainment_pct >= 60 ? "#ffc107" : "#dc3545"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="table-responsive mt-3">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>Rank</th><th>Branch</th><th>City</th>
                    <th className="text-end">Revenue</th><th className="text-end">Attainment</th><th className="text-end">Conv %</th>
                  </tr>
                </thead>
                <tbody>
                  {branch_ranking.map((b) => (
                    <tr key={b.branch_id}>
                      <td><RankMedal rank={b.rank} /></td>
                      <td><Link to={`/branches/${b.branch_id}`} className="text-decoration-none fw-medium">{b.name}</Link></td>
                      <td className="text-muted">{b.city}</td>
                      <td className="text-end">{formatInr(b.revenue)}</td>
                      <td className="text-end">{formatPct(b.attainment_pct)}</td>
                      <td className="text-end">{formatPct(b.conversion_rate_pct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LeaderBoard;