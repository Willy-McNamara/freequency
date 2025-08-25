#!/bin/bash

# Output Validation Script for Artillery Load Testing
# This script validates that Artillery can properly save results to files

echo "🔍 Artillery Output Validation Script"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${YELLOW}⚠️  $message${NC}"
    fi
}

# Function to check if file exists and has content
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        local size=$(wc -c < "$file")
        if [ "$size" -gt 0 ]; then
            print_status "PASS" "$description: $file ($size bytes)"
            return 0
        else
            print_status "FAIL" "$description: $file exists but is empty"
            return 1
        fi
    else
        print_status "FAIL" "$description: $file not found"
        return 1
    fi
}

echo "📋 Step 1: Checking current directory and permissions"
echo "-----------------------------------------------------"
echo "Current directory: $(pwd)"
echo "Write permissions: $(ls -ld . | awk '{print $1}')"
echo ""

echo "📋 Step 2: Cleaning up any existing test files"
echo "-----------------------------------------------"
rm -f *.json *.csv *.txt
echo "Cleanup completed"
echo ""

echo "📋 Step 3: Testing Artillery output functionality"
echo "-------------------------------------------------"
echo "Running a minimal test to validate file output..."

# Create a minimal test configuration
cat > validation-test.yml << 'EOF'
config:
  target: "https://demo.freequencyapp.com"
  phases:
    - duration: 10
      arrivalRate: 1
      name: "Validation test"
  http:
    timeout: 10
    headers:
      User-Agent: "Artillery Validation Test"

scenarios:
  - name: "Health check only"
    flow:
      - get:
          url: "/health"
          expect:
            - statusCode: 200
EOF

echo "Created validation test configuration"
echo ""

# Run the validation test
echo "Running validation test (10 seconds)..."
if JWT_TOKEN=$JWT_TOKEN artillery run --output validation-results.json validation-test.yml; then
    print_status "PASS" "Artillery test execution completed successfully"
else
    print_status "FAIL" "Artillery test execution failed"
    exit 1
fi

echo ""

echo "📋 Step 4: Validating output files"
echo "-----------------------------------"
validation_passed=true

# Check if the main results file was created
if ! check_file "validation-results.json" "Main results file"; then
    validation_passed=false
fi

# Check if we can read the JSON content
if [ -f "validation-results.json" ]; then
    echo ""
    echo "📊 File content validation:"
    if command -v jq &> /dev/null; then
        echo "JSON structure validation:"
        if jq empty validation-results.json 2>/dev/null; then
            print_status "PASS" "JSON file is valid"

            # Check for expected fields in Artillery v2.0.0
            if jq -e '.aggregate' validation-results.json >/dev/null 2>&1; then
                print_status "PASS" "Contains aggregate metrics"
            else
                print_status "FAIL" "Missing aggregate metrics"
                validation_passed=false
            fi

            # Check for counters in Artillery v2.0.0 structure
            if jq -e '.aggregate.counters' validation-results.json >/dev/null 2>&1; then
                print_status "PASS" "Contains counters (Artillery v2.0.0 structure)"
            else
                print_status "FAIL" "Missing counters"
                validation_passed=false
            fi

            # Check for basic HTTP metrics
            if jq -e '.aggregate.counters."http.requests"' validation-results.json >/dev/null 2>&1; then
                print_status "PASS" "Contains HTTP request counts"
            else
                print_status "FAIL" "Missing HTTP request counts"
                validation_passed=false
            fi

            # Check for response time metrics
            if jq -e '.aggregate.latency' validation-results.json >/dev/null 2>&1; then
                print_status "PASS" "Contains latency metrics"
            else
                print_status "WARN" "Latency metrics structure may be different"
                # This is not a failure, just a warning
            fi
        else
            print_status "FAIL" "JSON file is invalid"
            validation_passed=false
        fi
    else
        echo "jq not available - checking file manually:"
        if grep -q "aggregate" validation-results.json; then
            print_status "PASS" "File contains expected content"
        else
            print_status "FAIL" "File missing expected content"
            validation_passed=false
        fi
    fi
fi

echo ""

echo "📋 Step 5: Testing analysis script"
echo "-----------------------------------"
if [ -f "analyze-results.sh" ]; then
    chmod +x analyze-results.sh
    echo "Running analysis script on validation results..."

    # Copy validation results to a name the analysis script expects
    cp validation-results.json baseline-results.json

    if ./analyze-results.sh > validation-analysis.txt 2>&1; then
        print_status "PASS" "Analysis script executed successfully"
        if [ -f "validation-analysis.txt" ]; then
            echo "Analysis output saved to validation-analysis.txt"
            # Check if analysis actually found results
            if grep -q "BASELINE TEST RESULTS" validation-analysis.txt; then
                print_status "PASS" "Analysis script found and processed results"
            else
                print_status "WARN" "Analysis script ran but may not have processed results correctly"
            fi
        fi
    else
        print_status "FAIL" "Analysis script failed"
        validation_passed=false
    fi
else
    print_status "FAIL" "Analysis script not found"
    validation_passed=false
fi

echo ""

echo "📋 Step 6: Final Validation Summary"
echo "-----------------------------------"
if [ "$validation_passed" = true ]; then
    print_status "PASS" "ALL VALIDATIONS PASSED - Ready for stress testing!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Run stress test: npm run test:stress:output"
    echo "2. Analyze results: npm run analyze"
    echo "3. Review performance under extreme load"
else
    print_status "FAIL" "VALIDATION FAILED - Fix issues before stress testing"
    echo ""
    echo "🔧 Issues to resolve:"
    echo "1. Check Artillery installation and version"
    echo "2. Verify file permissions in current directory"
    echo "3. Ensure JWT_TOKEN environment variable is set"
    echo "4. Check for any error messages above"
fi

echo ""

echo "📁 Files created during validation:"
ls -la *.json *.txt 2>/dev/null || echo "No validation files found"

echo ""
echo "🧹 Cleanup:"
echo "Run 'npm run clean' to remove validation files when ready"
