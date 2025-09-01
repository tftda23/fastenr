#!/bin/bash

# Fastenr Testing Framework CLI Helper
# Makes it easy for AI assistants to run tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Fastenr Testing Framework CLI Helper"
    echo "===================================="
    echo ""
    echo "Usage: ./run-tests.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup                 - Install dependencies and setup framework"
    echo "  parse                 - Parse master test plan and categorize tests"
    echo "  generate              - Generate automated test files"
    echo "  run [OPTIONS]         - Run automated tests"
    echo "  report                - Generate comprehensive test report"
    echo "  all                   - Run full pipeline (parse + generate + run + report)"
    echo "  clean                 - Clean up generated files and reports"
    echo "  help                  - Show this help message"
    echo ""
    echo "Run Options:"
    echo "  --critical            - Run only critical priority tests"
    echo "  --high                - Run only high priority tests"
    echo "  --auth                - Run only authentication tests"
    echo "  --dashboard           - Run only dashboard tests"
    echo "  --accounts            - Run only accounts tests"
    echo "  --admin               - Run only admin tests"
    echo ""
    echo "Examples:"
    echo "  ./run-tests.sh setup"
    echo "  ./run-tests.sh run --critical"
    echo "  ./run-tests.sh run --auth"
    echo "  ./run-tests.sh all"
    echo ""
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "test-runner.js" ]; then
        print_error "Please run this script from the testing-framework directory"
        exit 1
    fi
}

# Function to setup the framework
setup_framework() {
    print_status "Setting up Fastenr Testing Framework..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Install Playwright browsers
    print_status "Installing Playwright browsers..."
    npx playwright install
    
    # Create necessary directories
    mkdir -p reports screenshots debug auth-states
    
    print_success "Framework setup completed successfully!"
}

# Function to run tests with options
run_tests() {
    local category=""
    local priority=""
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --critical)
                priority="critical"
                shift
                ;;
            --high)
                priority="high"
                shift
                ;;
            --auth)
                category="authentication"
                shift
                ;;
            --dashboard)
                category="dashboard"
                shift
                ;;
            --accounts)
                category="accounts"
                shift
                ;;
            --admin)
                category="admin"
                shift
                ;;
            *)
                print_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    # Build command
    local cmd="node test-runner.js --action=run"
    
    if [ ! -z "$category" ]; then
        cmd="$cmd --category=$category"
        print_status "Running tests for category: $category"
    fi
    
    if [ ! -z "$priority" ]; then
        cmd="$cmd --priority=$priority"
        print_status "Running tests with priority: $priority"
    fi
    
    if [ -z "$category" ] && [ -z "$priority" ]; then
        print_status "Running all automated tests..."
    fi
    
    # Execute command
    eval $cmd
}

# Function to clean up generated files
clean_framework() {
    print_status "Cleaning up generated files..."
    
    # Remove generated test files (keep examples)
    find tests -name "*.spec.js" -not -path "*/examples/*" -delete 2>/dev/null || true
    
    # Remove reports (keep directory)
    rm -f reports/*.json reports/*.csv reports/*.html 2>/dev/null || true
    
    # Remove screenshots and debug files
    rm -rf reports/screenshots/* reports/debug/* 2>/dev/null || true
    
    # Remove auth states
    rm -rf auth-states/* 2>/dev/null || true
    
    print_success "Cleanup completed!"
}

# Main script logic
main() {
    check_directory
    
    case "${1:-help}" in
        setup)
            setup_framework
            ;;
        parse)
            print_status "Parsing master test plan..."
            node test-runner.js --action=parse
            ;;
        generate)
            print_status "Generating automated test files..."
            node test-runner.js --action=generate
            ;;
        run)
            shift # Remove 'run' from arguments
            run_tests "$@"
            ;;
        report)
            print_status "Generating comprehensive test report..."
            node test-runner.js --action=report
            ;;
        all)
            print_status "Running full test pipeline..."
            node test-runner.js --action=all
            ;;
        clean)
            clean_framework
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"