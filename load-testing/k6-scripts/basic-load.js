import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics for tracking errors
const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up to 10 users
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 20 }, // Ramp up to 20 users
    { duration: "5m", target: 20 }, // Stay at 20 users
    { duration: "2m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests must complete below 2s
    http_req_failed: ["rate<0.1"], // Error rate must be less than 10%
    errors: ["rate<0.1"], // Custom error rate
  },
};

const BASE_URL = "https://demo.freequencyapp.com";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6 Load Test",
      Accept: "application/json",
    },
  };

  // Test health endpoint
  const healthCheck = http.get(`${BASE_URL}/health`, params);
  check(healthCheck, {
    "health status is 200": (r) => r.status === 200,
    "health response time < 500ms": (r) => r.timings.duration < 500,
  });

  // Test main page
  const mainPage = http.get(`${BASE_URL}/`, params);
  check(mainPage, {
    "main page status is 200": (r) => r.status === 200,
    "main page response time < 1000ms": (r) => r.timings.duration < 1000,
  });

  // Test API endpoints
  const instruments = http.get(`${BASE_URL}/api/instruments`, params);
  check(instruments, {
    "instruments status is 200": (r) => r.status === 200,
    "instruments response time < 1500ms": (r) => r.timings.duration < 1500,
  });

  const tags = http.get(`${BASE_URL}/api/tags`, params);
  check(tags, {
    "tags status is 200": (r) => r.status === 200,
    "tags response time < 1500ms": (r) => r.timings.duration < 1500,
  });

  // Test authenticated endpoints (should get 401)
  const sessions = http.get(`${BASE_URL}/api/sessions`, params);
  check(sessions, {
    "sessions status is 401 (unauthorized)": (r) => r.status === 401,
    "sessions response time < 1500ms": (r) => r.timings.duration < 1500,
  });

  // Record errors for custom metrics
  if (
    healthCheck.status !== 200 ||
    mainPage.status !== 200 ||
    instruments.status !== 200 ||
    tags.status !== 200 ||
    sessions.status !== 401
  ) {
    errorRate.add(1);
  }

  sleep(1);
}
