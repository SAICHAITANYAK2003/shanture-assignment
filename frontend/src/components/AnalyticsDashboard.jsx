import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import api from "../services/api";

export default function AnalyticsDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchData(s, e) {
    setLoading(true);
    try {
      const res = await api.get("/analytics/overview", {
        params: { startDate: s.toISOString(), endDate: e.toISOString() },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  const revenueOption = {
    xAxis: { type: "category", data: ["Revenue"] },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: [data?.totalRevenue || 0] }],
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div>
          <label>Start</label>
          <br />
          <DatePicker selected={startDate} onChange={setStartDate} />
        </div>
        <div>
          <label>End</label>
          <br />
          <DatePicker selected={endDate} onChange={setEndDate} />
        </div>
        <div>
          <button onClick={() => fetchData(startDate, endDate)}>Refresh</button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {data && (
        <>
          <h3>Total Revenue: ₹{data.totalRevenue.toFixed(2)}</h3>
          <h4>Avg Order Value: ₹{data.avgOrderValue.toFixed(2)}</h4>

          <div style={{ width: "100%", height: 300 }}>
            <ReactECharts option={revenueOption} style={{ height: 300 }} />
          </div>

          <h4>Top Products</h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((tp) => (
                <tr key={tp.productId}>
                  <td>{tp.name}</td>
                  <td>{tp.totalSold}</td>
                  <td>
                    {/* can't show revenue per product unless included */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
