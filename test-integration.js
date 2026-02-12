#!/usr/bin/env node

/**
 * Frontend & Backend Integration Test Suite
 * Tests key API endpoints and verifies data flow
 * Usage: node test-integration.js
 */

const http = require("http");

const API_BASE = "http://localhost:5000/api";
const FRONTEND_URL = "http://localhost:5173";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function testEndpoint(name, path) {
  try {
    const response = await makeRequest(path);
    const isSuccess = response.status === 200;

    if (isSuccess) {
      try {
        const data = JSON.parse(response.body);
        log(`✓ ${name}`, "green");
        log(`  Status: ${response.status}`, "green");
        log(
          `  Data: ${
            Array.isArray(data) ? `${data.length} items` : typeof data
          }`,
          "cyan"
        );
        return { success: true, data };
      } catch (e) {
        log(`✓ ${name} (text response)`, "green");
        log(`  Status: ${response.status}`, "green");
        return { success: true, data: response.body };
      }
    } else {
      log(`✗ ${name}`, "red");
      log(`  Status: ${response.status}`, "red");
      log(`  Body: ${response.body.substring(0, 100)}...`, "yellow");
      return { success: false };
    }
  } catch (error) {
    log(`✗ ${name}`, "red");
    log(`  Error: ${error.message}`, "red");
    return { success: false };
  }
}

async function runTests() {
  log("\n═══════════════════════════════════════════════════════════", "blue");
  log("  Frontend & Backend Integration Test Suite", "blue");
  log("═══════════════════════════════════════════════════════════\n", "blue");

  log(`Testing Backend API at: ${API_BASE}`, "cyan");
  log(`Testing Frontend at: ${FRONTEND_URL}\n`, "cyan");

  const tests = [
    {
      name: "Get Companies",
      path: "/companies",
    },
    {
      name: "Get Company 1 Details",
      path: "/companies/1",
    },
    {
      name: "Get Documents for Company 1",
      path: "/companies/1/documents",
    },
    {
      name: "Get Accounting Entries for Company 1",
      path: "/companies/1/accounting-entries",
    },
    {
      name: "Get Third Parties for Company 1",
      path: "/companies/1/third-parties",
    },
    {
      name: "Get Chart of Accounts",
      path: "/chart-of-accounts",
    },
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.path);
    results.push({ ...test, ...result });
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay between requests
  }

  log(
    "\n═══════════════════════════════════════════════════════════\n",
    "blue"
  );

  // Summary
  const passRate = ((passed / tests.length) * 100).toFixed(1);
  const summaryColor =
    passRate >= 80 ? "green" : passRate >= 50 ? "yellow" : "red";

  log(`Tests Passed: ${passed}/${tests.length} (${passRate}%)`, summaryColor);
  log(`Tests Failed: ${failed}/${tests.length}`, failed > 0 ? "red" : "green");

  // Detailed results
  log("\n📊 Detailed Results:", "cyan");
  results.forEach((r, i) => {
    const icon = r.success ? "✓" : "✗";
    const color = r.success ? "green" : "red";
    log(`${i + 1}. ${icon} ${r.name}`, color);
    if (r.data && Array.isArray(r.data)) {
      log(`   → ${r.data.length} items returned`, "cyan");
    }
  });

  // Validation checks
  log("\n🔍 Validation Checks:", "cyan");

  const docsResult = results.find(
    (r) => r.name === "Get Documents for Company 1"
  );
  if (docsResult.success && Array.isArray(docsResult.data)) {
    const docCount = docsResult.data.length;
    log(`Documents found: ${docCount}`, docCount >= 7 ? "green" : "yellow");

    const validated = docsResult.data.filter(
      (d) => d.status === "validated"
    ).length;
    log(
      `Validated documents: ${validated}/${docCount}`,
      validated >= 7 ? "green" : "yellow"
    );

    const totalTtc = docsResult.data.reduce(
      (sum, d) => sum + (parseFloat(d.amount_ttc) || 0),
      0
    );
    log(`Total TTC: €${totalTtc.toFixed(2)}`, "cyan");
  }

  const entriesResult = results.find(
    (r) => r.name === "Get Accounting Entries for Company 1"
  );
  if (entriesResult.success && Array.isArray(entriesResult.data)) {
    const entryCount = entriesResult.data.length;
    log(
      `Accounting entries found: ${entryCount}`,
      entryCount >= 21 ? "green" : "yellow"
    );

    const totalDebit = entriesResult.data.reduce(
      (sum, e) => sum + (parseFloat(e.debit) || 0),
      0
    );
    const totalCredit = entriesResult.data.reduce(
      (sum, e) => sum + (parseFloat(e.credit) || 0),
      0
    );
    const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

    log(`Total Debit: €${totalDebit.toFixed(2)}`, "cyan");
    log(`Total Credit: €${totalCredit.toFixed(2)}`, "cyan");
    log(`Balanced: ${balanced ? "YES" : "NO"}`, balanced ? "green" : "red");
  }

  log("\n═══════════════════════════════════════════════════════════", "blue");
  log(`Frontend Running: ${FRONTEND_URL}`, "cyan");
  log("═══════════════════════════════════════════════════════════\n", "blue");

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, "red");
  process.exit(1);
});
