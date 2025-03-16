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
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  // Handle File Changes
  const handleFileChange = (e) => {
    setFiles((prevFiles) => {
      const newFiles = Array.from(e.target.files);
      // console.log("Updated no of files:", newFiles.length);
      // console.log("Updated files:", newFiles);
      return newFiles;
    });
    setError("");
  };

  // Handle Upload videos
  const handleUpload = async () => {
    // If no file selected return error
    if (files.length === 0) {
      setError("Please select files first");
      return;
    }

    // begin processing
    setProcessing(true);
    setResults(null);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    // investigate form data
    console.log("FormData : ")
    for (let pair of formData.entries()) {
      console.log(pair[0],":", pair[1]['name']); // Logs: files File {...}
    }

    // call API
    try {
      setCurrentStep("Uploading videos...");

      const response = await axios.post("http://localhost:8000/upload-videos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Upload response:", response.data);
      // set currrent step to processing 
      setCurrentStep("Processing videos...");
      await new Promise((resolve) => setTimeout(resolve, 4000));

      let mockData = [];

      if (response.data.success) {
        const payload = response.data.payload;
        const topicFrequencyMap = {};

        // Count occurrences of each topic
        for (const key in payload) {
          const topic = payload[key];
          topicFrequencyMap[topic] = (topicFrequencyMap[topic] || 0) + 1;
        }

        // Convert to 2D array format
        mockData = Object.entries(topicFrequencyMap);

        console.log("Formatted Data:", mockData);
        setResults(mockData);
      } else {
        console.error("Something went wrong:", response.data.message);
        console.error("Error Message:", response.data.payload)  
      }

    } catch (err) {
      setError("Error processing your videos. Please try again.");
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
        <h2>Upload Videos for Trend Analysis</h2>
        <div className="file-input-container">
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            multiple
            disabled={processing}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "Choose Video Files"}
          </label>
        </div>
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || processing}
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
