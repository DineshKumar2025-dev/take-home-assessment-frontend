import { useEffect, useState,useRef } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./TimeRangeSelector";
import ExportButtons from "./ExportButtons";
function formatPct(value) {
  return value === null || value === undefined ? "—" : `${value.toFixed(0)}%`;
}

function StatCard({ label, value, sub, variant, loading }) {
  return (
    <div className="col-6 col-md-3">
      <div className="border rounded p-3 bg-white h-100">
        <div className="text-muted small text-uppercase">{label}</div>
        <div className={`fs-4 fw-semibold ${variant ? `text-${variant}` : ""} ${loading ? "opacity-50" : ""}`}
             style={{ transition: "opacity 0.2s" }}>
          {value}
        </div>
        {sub && <div className="text-muted small mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function onTimeVariant(pct) {
  if (pct === null || pct === undefined) return "secondary";
  if (pct >= 90) return "success";
  if (pct >= 70) return "warning";
  return "danger";
}

const EMPTY_STATE = {
  summary: {
    total_deliveries: 0, on_time: 0, late: 0,
    on_time_pct: null, avg_days_to_deliver: null, avg_days_late: null,
  },
  delay_reasons: [],
  branch_comparison: [],
  monthly_trend: [],
};

function DeliveryDelay() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");
  const pdfRef = useRef(null);
  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/deliveries${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const { summary, delay_reasons, branch_comparison } = data;
  const pieData = [
    { name: "On time", value: summary.on_time },
    { name: "Late", value: summary.late },
  ];
  const hasDeliveries = summary.total_deliveries > 0;
  const csvRows = branch_comparison.map((b) => ({
    Branch: b.name,
    City: b.city,
    "Total Deliveries": b.total_deliveries,
    "On Time": b.on_time,
    Late: b.late,
    "On Time %": b.on_time_pct,
    "Avg Days": b.avg_days_to_deliver,
  }));
  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest delivery data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      

      
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1">Delivery &amp; Delay</h1>
          <p className="text-muted small mb-0">
            {loading ? "Loading…" : `On-time performance across ${summary.total_deliveries} deliveries`}
          </p>
        </div>
        <ExportButtons
          csvData={csvRows}
          csvFilename="delivery-delay.csv"
          pdfRef={pdfRef}
          pdfFilename="delivery-delay.pdf"
          pdfTitle="Delivery & Delay Report"
        />
      </div>
      <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />
      <div ref={pdfRef}>
      <div className="row g-3 mb-4">
        <StatCard
          label="On-time rate"
          value={formatPct(summary.on_time_pct)}
          sub={`${summary.on_time} of ${summary.total_deliveries}`}
          variant={onTimeVariant(summary.on_time_pct)}
          loading={loading}
        />
        <StatCard label="Late deliveries" value={summary.late} variant={summary.late > 0 ? "danger" : "success"} loading={loading} />
        <StatCard label="Avg days to deliver" value={summary.avg_days_to_deliver !== null ? `${summary.avg_days_to_deliver}d` : "—"} loading={loading} />
        <StatCard label="Avg days (late only)" value={summary.avg_days_late !== null ? `${summary.avg_days_late}d` : "—"} loading={loading} />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">On-time vs late</h3>
            {!hasDeliveries ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No delivery data yet."}</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    <Cell fill="#198754" />
                    <Cell fill="#dc3545" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Delay reasons</h3>
            {delay_reasons.length === 0 ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No delays recorded."}</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={delay_reasons} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="reason" fontSize={12} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc3545" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Branch comparison</h3>
        {branch_comparison.length === 0 ? (
          <div className="text-muted text-center py-5">{loading ? "Loading…" : "No branch data yet."}</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(branch_comparison.length * 50, 200)}>
              <BarChart data={branch_comparison} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} unit="%" />
                <YAxis type="category" dataKey="name" fontSize={13} width={110} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="on_time_pct" radius={[0, 6, 6, 0]} barSize={26}>
                  {branch_comparison.map((b, i) => (
                    <Cell key={i} fill={b.on_time_pct >= 90 ? "#198754" : b.on_time_pct >= 70 ? "#ffc107" : "#dc3545"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="table-responsive mt-3">
              <table className="blue-table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Branch</th><th>City</th>
                    <th className="">Deliveries</th>
                    <th className="">On time</th>
                    <th className="">Late</th>
                    <th className="">On-time %</th>
                    <th className="">Avg days</th>
                  </tr>
                </thead>
                <tbody>
                  {branch_comparison.map((b) => (
                    <tr key={b.branch_id}>
                      <td><Link to={`/branches/${b.branch_id}`} className="text-decoration-none fw-medium">{b.name}</Link></td>
                      <td className="text-muted">{b.city}</td>
                      <td className="">{b.total_deliveries}</td>
                      <td className=" text-success">{b.on_time}</td>
                      <td className=" text-danger">{b.late}</td>
                      <td className="">{formatPct(b.on_time_pct)}</td>
                      <td className="">{b.avg_days_to_deliver !== null ? `${b.avg_days_to_deliver}d` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}

export default DeliveryDelay;