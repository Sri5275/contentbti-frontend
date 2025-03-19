import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Header from "./components/Header";

function App() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [ldaResults, setLdaResults] = useState(null);
  const [bertopicResults, setBertopicResults] = useState(null);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Validate file types (only allow video files)
    const validFiles = selectedFiles.filter((file) => file.type.startsWith("video/"));
    if (validFiles.length === 0) {
      setError("Please select valid video files (e.g., mp4, mov).");
      setFiles([]); // Clear invalid files
    } else {
      setFiles(validFiles);
      setError(""); // Clear any previous errors
    }
  };

  // Handle file upload and processing
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files first.");
      return;
    }

    setProcessing(true);
    setLdaResults(null);
    setBertopicResults(null);
    setError(""); // Clear any previous errors

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setCurrentStep("Uploading videos...");

      // Fetch results for both models
      const response = await axios.post("http://localhost:8000/upload-videos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCurrentStep("Processing videos...");
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Simulate processing delay

      if (response.data.success) {
        const payload = response.data.payload;

        // Process LDA results
        const ldaTopics = {};
        Object.values(payload.Lda_results).forEach((fileTopics) => {
          Object.entries(fileTopics).forEach(([topic, frequency]) => {
            ldaTopics[topic] = (ldaTopics[topic] || 0) + frequency;
          });
        });
        setLdaResults({
          topics: Object.entries(ldaTopics),
          accuracy: payload.Lda_accuracy,
        });

        // Process BertTopic results
        const bertTopics = {};
        Object.values(payload.bert_results).forEach((fileTopics) => {
          fileTopics.forEach((topic) => {
            bertTopics[topic] = (bertTopics[topic] || 0) + 1;
          });
        });
        setBertopicResults({
          topics: Object.entries(bertTopics),
          accuracy: payload.Bert_accuracy,
        });
      } else {
        setError("Something went wrong: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      // Handle different types of errors
      if (err.response) {
        // Backend returned an error response
        setError(`Server error: ${err.response.data.message || "Unknown error"}`);
      } else if (err.request) {
        // No response received (network error)
        setError("Network error: Please check your connection.");
      } else {
        // Other errors
        setError("Error processing your videos. Please try again.");
      }
      console.error("Error details:", err); // Log the error for debugging
    } finally {
      setProcessing(false);
      setCurrentStep("");
    }
  };

  // Get the top trending topic
  const getTrendingTopic = (topics) => {
    if (!topics || topics.length === 0) return null;
    return topics.reduce((max, current) => (current[1] > max[1] ? current : max));
  };

  // Prepare data for the bar chart
  const prepareChartData = (topics) => {
    if (!topics) return [];
    return topics.map(([topic, frequency]) => ({ topic, frequency }));
  };

  // Dashboard component
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
            {files.length > 0 ? `${files.length} file(s) selected` : "Choose Video Files"}
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
      {(ldaResults || bertopicResults) && (
        <div className="results-section">
          <h2>Trend Analysis Results</h2>
          <div className="visualization-container">
            {/* LDA Results */}
            {ldaResults && (
              <div className="model-results">
                <h3>LDA Model</h3>
                <div className="trending-topic">
                  <h4>Top Trending Topic</h4>
                  <div className="trend-highlight">
                    <span className="trend-name">{getTrendingTopic(ldaResults.topics)[0]}</span>
                    <span className="trend-frequency">
                      {getTrendingTopic(ldaResults.topics)[1]} mentions
                    </span>
                  </div>
                </div>
                <div className="accuracy-metric">
                  <h4>Model Accuracy</h4>
                  <p>{ldaResults.accuracy}%</p>
                </div>
                <div className="chart-container">
                  <h4>Topic Frequency Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={prepareChartData(ldaResults.topics)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" angle={-45} textAnchor="end" height={70} interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="frequency" fill="#4D7CFE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* BertTopic Results */}
            {bertopicResults && (
              <div className="model-results">
                <h3>BertTopic Model</h3>
                <div className="trending-topic">
                  <h4>Top Trending Topic</h4>
                  <div className="trend-highlight">
                    <span className="trend-name">{getTrendingTopic(bertopicResults.topics)[0]}</span>
                    <span className="trend-frequency">
                      {getTrendingTopic(bertopicResults.topics)[1]} mentions
                    </span>
                  </div>
                </div>
                <div className="accuracy-metric">
                  <h4>Model Accuracy</h4>
                  <p>{bertopicResults.accuracy}%</p>
                </div>
                <div className="chart-container">
                  <h4>Topic Frequency Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={prepareChartData(bertopicResults.topics)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" angle={-45} textAnchor="end" height={70} interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="frequency" fill="#FF6B6B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;