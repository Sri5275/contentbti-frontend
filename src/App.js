import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Header from "./components/Header";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") ? true : false
  );
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setProcessing(true);
    setResults(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      // Simulate the steps with timeouts since we don't have the real backend connected
      setCurrentStep("Cleaning audio");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentStep("Extracting text");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentStep("Analyzing text");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentStep("Extracting trending topics");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would be an actual API call
      // const response = await axios.post('http://your-backend-url/api/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      // Mock response data
      const mockData = [
        ["Politics", 35],
        ["Cricket", 28],
        ["Bollywood", 22],
        ["Technology", 18],
        ["Education", 15],
        ["Climate Change", 12],
        ["Healthcare", 10],
        ["Fashion", 8],
      ];

      setResults(mockData);
    } catch (err) {
      setError("Error processing your video. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
      setCurrentStep("");
    }
  };

  const getTrendingTopic = () => {
    if (!results || results.length === 0) return null;

    return results.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );
  };

  const prepareChartData = () => {
    if (!results) return [];

    return results.map((item) => ({
      topic: item[0],
      frequency: item[1],
    }));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const Dashboard = () => (
    <div className="dashboard">
      <div className="upload-section">
        <h2>Upload Video for Trend Analysis</h2>
        <div className="file-input-container">
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            disabled={processing}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            {file ? file.name : "Choose Video File"}
          </label>
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || processing}
          className="upload-button"
        >
          {processing ? "Processing..." : "Upload and Analyze"}
        </button>

        {error && <div className="error-message">{error}</div>}

        {processing && (
          <div className="processing-indicator">
            <div className="loader"></div>
            <div className="step-indicator">
              <p>
                Current step: <strong>{currentStep}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {results && (
        <div className="results-section">
          <h2>Trend Analysis Results</h2>

          <div className="trending-topic">
            <h3>Top Trending Topic</h3>
            <div className="trend-highlight">
              <span className="trend-name">{getTrendingTopic()[0]}</span>
              <span className="trend-frequency">
                {getTrendingTopic()[1]} mentions
              </span>
            </div>
          </div>

          <div className="chart-container">
            <h3>Topic Frequency Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={prepareChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topic"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" fill="#4D7CFE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Router>
      <div className="app">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                isLoggedIn ? (
                  <Navigate to="/" />
                ) : (
                  <Signup onSignup={handleLogin} />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
