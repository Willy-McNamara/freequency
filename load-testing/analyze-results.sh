#!/bin/bash

# Freequency Load Test Results Analyzer
# Analyzes Artillery test results and provides insights

echo "🔍 Freequency Load Test Results Analyzer"
echo "========================================"
echo ""

# Check if we have any result files
if [ ! -f "baseline-results.json" ] && [ ! -f "stress-results.json" ]; then
    echo "❌ No test result files found!"
    echo "Run a test first with: npm run test:artillery:output"
    echo ""
    echo "Available files:"
    ls -la *.json 2>/dev/null || echo "No JSON files found"
    exit 1
fi

# Function to analyze JSON results
analyze_json() {
    local file=$1
    echo "📊 Analyzing $file..."
    echo "----------------------------------------"

    # Extract key metrics using jq if available
    if command -v jq &> /dev/null; then
        echo "📈 Key Metrics:"

        # Total requests
        local total_requests=$(jq -r '.aggregate.counters."http.requests" // "N/A"' "$file" 2>/dev/null)
        echo "   Total Requests: $total_requests"

        # Response codes
        local http_200=$(jq -r '.aggregate.counters."http.codes.200" // "N/A"' "$file" 2>/dev/null)
        local http_302=$(jq -r '.aggregate.counters."http.codes.302" // "N/A"' "$file" 2>/dev/null)
        local http_404=$(jq -r '.aggregate.counters."http.codes.404" // "N/A"' "$file" 2>/dev/null)
        local http_429=$(jq -r '.aggregate.counters."http.codes.429" // "N/A"' "$file" 2>/dev/null)
        local http_500=$(jq -r '.aggregate.counters."http.codes.500" // "N/A"' "$file" 2>/dev/null)

        echo "   HTTP 200 (Success): $http_200"
        echo "   HTTP 302 (Redirects): $http_302"
        echo "   HTTP 404 (Not Found): $http_404"
        echo "   HTTP 429 (Rate Limited): $http_429"
        echo "   HTTP 500 (Server Errors): $http_500"

        # Response times
        local response_time_median=$(jq -r '.aggregate.latency.median // "N/A"' "$file" 2>/dev/null)
        local response_time_p95=$(jq -r '.aggregate.latency.p95 // "N/A"' "$file" 2>/dev/null)
        local response_time_p99=$(jq -r '.aggregate.latency.p99 // "N/A"' "$file" 2>/dev/null)

        echo "   Response Time - Median: ${response_time_median}ms"
        echo "   Response Time - P95: ${response_time_p95}ms"
        echo "   Response Time - P99: ${response_time_p99}ms"

        # Virtual users
        local vusers_created=$(jq -r '.aggregate.counters."vusers.created" // "N/A"' "$file" 2>/dev/null)
        local vusers_failed=$(jq -r '.aggregate.counters."vusers.failed" // "N/A"' "$file" 2>/dev/null)

        echo "   Virtual Users Created: $vusers_created"
        echo "   Virtual Users Failed: $vusers_failed"

        # Calculate success rate
        if [ "$vusers_created" != "N/A" ] && [ "$vusers_failed" != "N/A" ] && [ "$vusers_created" -gt 0 ]; then
            local success_rate=$(( (vusers_created - vusers_failed) * 100 / vusers_created ))
            echo "   Success Rate: ${success_rate}%"
        fi

        # Check for specific Artillery v2.0.0 structure
        echo ""
        echo "🔍 Artillery v2.0.0 Structure Analysis:"
        if jq -e '.aggregate.counters."http.requests"' "$file" >/dev/null 2>&1; then
            echo "   ✅ HTTP metrics structure found (Artillery v2.0.0)"
        else
            echo "   ⚠️  HTTP metrics structure not found"
        fi

        if jq -e '.aggregate.latency' "$file" >/dev/null 2>&1; then
            echo "   ✅ Latency metrics structure found"
        else
            echo "   ⚠️  Latency metrics structure not found"
        fi

    else
        echo "⚠️  jq not available - basic file analysis:"
        echo "   File size: $(wc -c < "$file") bytes"
        echo "   Contains 'aggregate': $(grep -c 'aggregate' "$file" || echo '0')"
        echo "   Contains 'http': $(grep -c 'http' "$file" || echo '0')"
        echo "   Contains 'requests': $(grep -c 'requests' "$file" || echo '0')"
    fi

    echo ""
}

# Analyze available results
if [ -f "baseline-results.json" ]; then
    echo "🎯 BASELINE TEST RESULTS"
    echo "========================"
    analyze_json "baseline-results.json"
fi

if [ -f "stress-results.json" ]; then
    echo "🔥 STRESS TEST RESULTS"
    echo "======================"
    analyze_json "stress-results.json"
fi

echo "📊 Overall Assessment"
echo "===================="

# Determine test type and provide insights
if [ -f "baseline-results.json" ] && [ -f "stress-results.json" ]; then
    echo "✅ Both baseline and stress tests completed!"
    echo "📈 Compare results to see performance degradation patterns"
    echo "🎯 Look for breaking points and failure modes"
elif [ -f "baseline-results.json" ]; then
    echo "✅ Baseline test completed!"
    echo "🔥 Ready for stress testing: npm run test:stress:output"
elif [ -f "stress-results.json" ]; then
    echo "✅ Stress test completed!"
    echo "📊 Review breaking points and failure modes"
else
    echo "❌ No valid test results found"
fi

echo ""
echo "📁 Result files created:"
ls -la *.json 2>/dev/null || echo "No result files found"
echo ""
echo "💡 Next steps:"
echo "1. Review the metrics above"
echo "2. Check the detailed JSON files for specific endpoint performance"
echo "3. Look for bottlenecks in response times"
echo "4. Identify where your system starts to struggle"
if [ ! -f "stress-results.json" ]; then
    echo "5. Run stress test if baseline looks good: npm run test:stress:output"
fi
echo ""
echo "🧹 Clean up files: npm run clean"
