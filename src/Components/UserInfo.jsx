import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./ComponentStyles/UserInfo.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = ["#5271ff", "#28a745", "#ff9800", "#e74c3c", "#8670ff", "#00bcd4", "#ffc107", "#9c27b0", "#607d8b"];

const UserInfo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserLocationInfo = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/admin/user-location`);
        // Normalize keys and ensure numeric usercount
        const normalize = arr =>
          (arr || []).map(item => ({
            ...item,
            usercount: Number(item.usercount || item.userCount || 0),
            country: item.country || item.Country || "Unknown",
            city: item.city || item.City || "Unknown",
            regionname: item.regionname || item.RegionName || "Unknown",
            os: item.os || item.OS || "Unknown"
          }));
        setData({
          ...res.data.userLocationInfo,
          countries: normalize(res.data.userLocationInfo.countries),
          cities: normalize(res.data.userLocationInfo.cities),
          regions: normalize(res.data.userLocationInfo.regions),
          os: normalize(res.data.userLocationInfo.os)
        });
      } catch (err) {
        setError("Failed to fetch user location info");
      } finally {
        setLoading(false);
      }
    };
    fetchUserLocationInfo();
  }, []);

  if (loading) return <div className="user-info-loading">Loading user location info...</div>;
  if (error) return <div className="user-info-error">{error}</div>;
  if (!data) return null;

  // Prepare data for charts
  const topCountries = data.countries
    .sort((a, b) => b.usercount - a.usercount)
    .slice(0, 7)
    .map((c, i) => ({ ...c, fill: COLORS[i % COLORS.length] }));

  const topCities = data.cities
    .sort((a, b) => b.usercount - a.usercount)
    .slice(0, 7);

  const topRegions = data.regions
    .sort((a, b) => b.usercount - a.usercount)
    .slice(0, 7);

  const osData = data.os.map((o, i) => ({
    ...o,
    fill: COLORS[i % COLORS.length]
  }));

  return (
    <div className="user-info-section">
      <h2>User Location & Device Analytics</h2>
      <div className="user-info-summary">
        <div className="user-info-summary-item">
          <span className="user-info-summary-label">Unique Visitors:</span>
          <span className="user-info-summary-value">{data.uniqueVisitors}</span>
        </div>
      </div>
      <div className="user-info-charts">
        <div className="user-info-chart">
          <h3>Top Countries</h3>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={topCountries}
                dataKey="usercount"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ country, percent }) =>
                  `${country || "Unknown"} (${(percent * 100).toFixed(1)}%)`
                }
                labelStyle={{ fontSize: 8 }}
              >
                {topCountries.map((entry, idx) => (
                  <Cell key={`cell-country-${idx}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="user-info-chart">
          <h3>Top Cities</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topCities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" tick={{ fill: "var(--user-info-axis-color)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--user-info-axis-color)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, color: "#222", background: "#fff", border: "1px solid #ccc" }}
                itemStyle={{ fontSize: 12, color: "#222" }}
                labelStyle={{ fontSize: 12, color: "#222" }}
              />
              <Bar dataKey="usercount" fill="#5271ff" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="user-info-chart">
          <h3>Top Regions</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={topRegions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="regionname" tick={{ fill: "var(--user-info-axis-color)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--user-info-axis-color)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, color: "#222", background: "#fff", border: "1px solid #ccc" }}
                itemStyle={{ fontSize: 12, color: "#222" }}
                labelStyle={{ fontSize: 12, color: "#222" }}
              />
              <Bar dataKey="usercount" fill="#28a745" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="user-info-chart">
          <h3>Operating Systems</h3>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={osData}
                dataKey="usercount"
                nameKey="os"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ os, percent }) =>
                  `${os || "Unknown"} (${(percent * 100).toFixed(1)}%)`
                }
                labelStyle={{ fontSize: 12 }}
              >
                {osData.map((entry, idx) => (
                  <Cell key={`cell-os-${idx}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;