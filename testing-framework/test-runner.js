#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const TestParser = require('./utils/test-parser');
const TestGenerator = require('./utils/test-generator');
const config = require('./config/test-config');

/**
 * Main Test Runner for Fastenr Testing Framework
 * 
 * Usage:
 * node test-runner.js --action=parse
 * node test-runner.js --action=generate
 * node test-runner.js --action=run --category=critical
 * node test-runner.js --action=report
 * node test-runner.js --action=all
 */
class FastenrTestRunner {
  constructor() {
    this.masterCsvPath = path.join(__dirname, 'fastenr_test_plan_master.csv');
    this.testsDir = path.join(__dirname, 'tests');
    this.reportsDir = path.join(__dirname, 'reports');
    this.parser = new TestParser(this.masterCsvPath);
    this.generator = new TestGenerator(config);
    this.testResults = [];
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Main execution method
   */
  async run() {
    const args = this.parseArguments();
    const action = args.action || 'help';

    console.log(`🚀 Fastenr Test Runner - Action: ${action}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('=' .repeat(60));

    try {
      switch (action) {
        case 'parse':
          await this.parseTestPlan();
          break;
        case 'generate':
          await this.generateTests();
          break;
        case 'run':
          await this.runTests(args.category, args.priority);
          break;
        case 'report':
          await this.generateReport();
          break;
        case 'all':
          await this.runFullPipeline();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = {};
    process.argv.slice(2).forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        args[key] = value || true;
      }
    });
    return args;
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.testsDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Parse the master test plan CSV
   */
  async parseTestPlan() {
    console.log('📋 Parsing master test plan...');
    
    await this.parser.parseTestPlan();
    const stats = this.parser.getAutomationStats();
    
    console.log('📊 Test Plan Analysis:');
    console.log(`   Total Test Cases: ${stats.total}`);
    console.log(`   Automated Tests: ${stats.automated} (${Math.round(stats.automated/stats.total*100)}%)`);
    console.log(`   Manual Tests: ${stats.manual} (${Math.round(stats.manual/stats.total*100)}%)`);
    console.log(`   Mixed Tests: ${stats.mixed} (${Math.round(stats.mixed/stats.total*100)}%)`);
    
    // Export categorized tests
    await this.parser.exportCategorizedTests(this.reportsDir);
    console.log('✅ Categorized test files exported to reports directory');
    
    // Save test index
    const testIndex = {
      timestamp: new Date().toISOString(),
      stats,
      testCases: this.parser.testCases,
      automatedTests: this.parser.automatedTests,
      manualTests: this.parser.manualTests,
      mixedTests: this.parser.mixedTests
    };
    
    fs.writeFileSync(
      path.join(this.reportsDir, 'test-index.json'),
      JSON.stringify(testIndex, null, 2)
    );
    
    console.log('✅ Test parsing completed successfully');
    return stats;
  }

  /**
   * Generate automated test files
   */
  async generateTests() {
    console.log('🔧 Generating automated test files...');
    
    // Parse test plan if not already done
    if (this.parser.testCases.length === 0) {
      await this.parseTestPlan();
    }
    
    // Generate test files for automated tests
    const automatedFiles = await this.generator.generateTestFiles(
      this.parser.automatedTests,
      this.testsDir
    );
    
    // Generate test files for mixed tests (with manual implementation notes)
    const mixedFiles = await this.generator.generateTestFiles(
      this.parser.mixedTests,
      this.testsDir
    );
    
    const allGeneratedFiles = [...automatedFiles, ...mixedFiles];
    
    console.log(`✅ Generated ${allGeneratedFiles.length} test files:`);
    console.log(`   Automated: ${automatedFiles.length}`);
    console.log(`   Mixed: ${mixedFiles.length}`);
    
    // Save generation report
    const generationReport = {
      timestamp: new Date().toISOString(),
      totalGenerated: allGeneratedFiles.length,
      automatedFiles,
      mixedFiles,
      summary: {
        successful: allGeneratedFiles.filter(f => f.status === 'generated').length,
        failed: allGeneratedFiles.filter(f => f.status === 'failed').length
      }
    };
    
    fs.writeFileSync(
      path.join(this.reportsDir, 'test-generation-report.json'),
      JSON.stringify(generationReport, null, 2)
    );
    
    console.log('✅ Test generation completed successfully');
    return generationReport;
  }

  /**
   * Run automated tests
   */
  async runTests(category = 'all', priority = 'all') {
    console.log(`🧪 Running tests - Category: ${category}, Priority: ${priority}`);
    
    try {
      // Install dependencies if needed
      this.ensureTestDependencies();
      
      // Build test command
      let testCommand = 'npx playwright test';
      
      if (category !== 'all') {
        testCommand += ` --grep "${category}"`;
      }
      
      if (priority !== 'all') {
        testCommand += ` --grep "${priority}"`;
      }
      
      // Add configuration
      testCommand += ` --config=playwright.config.js`;
      testCommand += ` --reporter=json`;
      
      console.log(`Executing: ${testCommand}`);
      
      // Run tests
      const output = execSync(testCommand, { 
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Tests completed successfully');
      
      // Parse and save results
      this.testResults = JSON.parse(output);
      this.saveTestResults();
      
    } catch (error) {
      console.log('⚠️  Tests completed with issues');
      console.log('Error output:', error.stdout || error.message);
      
      // Still try to save partial results
      try {
        this.testResults = JSON.parse(error.stdout || '{}');
        this.saveTestResults();
      } catch (parseError) {
        console.error('Could not parse test results');
      }
    }
  }

  /**
   * Ensure test dependencies are installed
   */
  ensureTestDependencies() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log('📦 Initializing package.json...');
      execSync('npm init -y', { cwd: process.cwd() });
    }
    
    // Check if Playwright is installed
    try {
      require.resolve('@playwright/test');
      console.log('✅ Playwright already installed');
    } catch (error) {
      console.log('📦 Installing Playwright...');
      execSync('npm install --save-dev @playwright/test csv-parser', { 
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      execSync('npx playwright install', { 
        cwd: process.cwd(),
        stdio: 'inherit'
      });
    }
  }

  /**
   * Save test results
   */
  saveTestResults() {
    const timestamp = new Date().toISOString();
    const resultsFile = path.join(this.reportsDir, `test-results-${timestamp.split('T')[0]}.json`);
    
    fs.writeFileSync(resultsFile, JSON.stringify(this.testResults, null, 2));
    console.log(`💾 Test results saved to: ${resultsFile}`);
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport() {
    console.log('📊 Generating comprehensive test report...');
    
    // Load test index if available
    const testIndexPath = path.join(this.reportsDir, 'test-index.json');
    let testIndex = {};
    if (fs.existsSync(testIndexPath)) {
      testIndex = JSON.parse(fs.readFileSync(testIndexPath, 'utf8'));
    }
    
    // Load latest test results
    const resultFiles = fs.readdirSync(this.reportsDir)
      .filter(file => file.startsWith('test-results-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    let latestResults = {};
    if (resultFiles.length > 0) {
      const latestResultFile = path.join(this.reportsDir, resultFiles[0]);
      latestResults = JSON.parse(fs.readFileSync(latestResultFile, 'utf8'));
    }
    
    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTestCases: testIndex.stats?.total || 0,
        automatedTests: testIndex.stats?.automated || 0,
        manualTests: testIndex.stats?.manual || 0,
        mixedTests: testIndex.stats?.mixed || 0,
        automationCoverage: testIndex.stats?.automationPercentage || 0
      },
      testExecution: {
        lastRun: latestResults.timestamp || 'Never',
        totalRun: latestResults.suites?.length || 0,
        passed: this.countTestsByStatus(latestResults, 'passed'),
        failed: this.countTestsByStatus(latestResults, 'failed'),
        skipped: this.countTestsByStatus(latestResults, 'skipped')
      },
      manualTestsRequired: testIndex.manualTests || [],
      mixedTestsRequiringImplementation: testIndex.mixedTests || [],
      recommendations: this.generateRecommendations(testIndex, latestResults)
    };
    
    // Save JSON report
    fs.writeFileSync(
      path.join(this.reportsDir, 'comprehensive-test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Generate CSV report
    await this.generateCSVReport(report);
    
    // Generate HTML report
    await this.generateHTMLReport(report);
    
    console.log('✅ Comprehensive test report generated');
    this.displayReportSummary(report);
    
    return report;
  }

  /**
   * Count tests by status from results
   */
  countTestsByStatus(results, status) {
    if (!results.suites) return 0;
    
    let count = 0;
    results.suites.forEach(suite => {
      if (suite.specs) {
        suite.specs.forEach(spec => {
          if (spec.tests) {
            spec.tests.forEach(test => {
              if (test.results && test.results.some(result => result.status === status)) {
                count++;
              }
            });
          }
        });
      }
    });
    
    return count;
  }

  /**
   * Generate recommendations based on test analysis
   */
  generateRecommendations(testIndex, results) {
    const recommendations = [];
    
    if (testIndex.stats?.automated < testIndex.stats?.total * 0.7) {
      recommendations.push({
        type: 'automation',
        priority: 'high',
        message: 'Consider increasing automation coverage. Currently below 70%.'
      });
    }
    
    if (testIndex.manualTests?.length > 20) {
      recommendations.push({
        type: 'manual-testing',
        priority: 'medium',
        message: `${testIndex.manualTests.length} manual tests require human execution.`
      });
    }
    
    if (this.countTestsByStatus(results, 'failed') > 0) {
      recommendations.push({
        type: 'test-failures',
        priority: 'critical',
        message: 'Address failing tests before deployment.'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate CSV report for manual test tracking
   */
  async generateCSVReport(report) {
    const csvHeaders = [
      'Test ID', 'Area', 'Feature', 'Type', 'Priority', 'Status', 
      'Automation Level', 'Last Executed', 'Result', 'Notes'
    ];
    
    const csvRows = [];
    
    // Add manual tests
    if (report.manualTestsRequired) {
      report.manualTestsRequired.forEach(test => {
        csvRows.push([
          test.testId, test.area, test.feature, 'Manual', test.priority,
          'Pending', 'Manual Only', 'Never', 'Not Executed', 
          'Requires manual execution'
        ]);
      });
    }
    
    // Add mixed tests
    if (report.mixedTestsRequiringImplementation) {
      report.mixedTestsRequiringImplementation.forEach(test => {
        csvRows.push([
          test.testId, test.area, test.feature, 'Mixed', test.priority,
          'Pending', 'Partial Automation', 'Never', 'Not Implemented',
          'Requires implementation completion'
        ]);
      });
    }
    
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    fs.writeFileSync(
      path.join(this.reportsDir, 'manual-test-tracking.csv'),
      csvContent
    );
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Fastenr Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric { font-size: 2em; font-weight: bold; color: #333; }
        .label { color: #666; font-size: 0.9em; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .manual-tests { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Fastenr Comprehensive Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <div class="metric">${report.summary.totalTestCases}</div>
            <div class="label">Total Test Cases</div>
        </div>
        <div class="card">
            <div class="metric">${report.summary.automationCoverage}%</div>
            <div class="label">Automation Coverage</div>
        </div>
        <div class="card">
            <div class="metric">${report.testExecution.passed}</div>
            <div class="label">Tests Passed</div>
        </div>
        <div class="card">
            <div class="metric">${report.summary.manualTests}</div>
            <div class="label">Manual Tests Required</div>
        </div>
    </div>
    
    <div class="recommendations">
        <h3>Recommendations</h3>
        ${report.recommendations.map(rec => `<p><strong>${rec.type}:</strong> ${rec.message}</p>`).join('')}
    </div>
    
    <div class="manual-tests">
        <h3>Manual Tests Required (${report.summary.manualTests})</h3>
        <p>These tests require human execution and cannot be automated:</p>
        <ul>
            ${report.manualTestsRequired.slice(0, 10).map(test => `<li>${test.testId}: ${test.description}</li>`).join('')}
            ${report.manualTestsRequired.length > 10 ? `<li>... and ${report.manualTestsRequired.length - 10} more</li>` : ''}
        </ul>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(
      path.join(this.reportsDir, 'test-report.html'),
      htmlContent
    );
  }

  /**
   * Display report summary in console
   */
  displayReportSummary(report) {
    console.log('\n📊 TEST REPORT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Test Cases: ${report.summary.totalTestCases}`);
    console.log(`Automation Coverage: ${report.summary.automationCoverage}%`);
    console.log(`Manual Tests Required: ${report.summary.manualTests}`);
    console.log(`Mixed Tests Needing Implementation: ${report.summary.mixedTests}`);
    console.log('\n📁 Reports Generated:');
    console.log(`   - ${this.reportsDir}/comprehensive-test-report.json`);
    console.log(`   - ${this.reportsDir}/manual-test-tracking.csv`);
    console.log(`   - ${this.reportsDir}/test-report.html`);
  }

  /**
   * Run full pipeline: parse, generate, run, report
   */
  async runFullPipeline() {
    console.log('🔄 Running full test pipeline...');
    
    await this.parseTestPlan();
    await this.generateTests();
    await this.runTests();
    await this.generateReport();
    
    console.log('✅ Full pipeline completed successfully');
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🧪 Fastenr Test Runner

Usage:
  node test-runner.js --action=<action> [options]

Actions:
  parse     - Parse master test plan and categorize tests
  generate  - Generate automated test files
  run       - Run automated tests [--category=<category>] [--priority=<priority>]
  report    - Generate comprehensive test report
  all       - Run full pipeline (parse + generate + run + report)
  help      - Show this help message

Examples:
  node test-runner.js --action=parse
  node test-runner.js --action=generate
  node test-runner.js --action=run --category=authentication
  node test-runner.js --action=run --priority=critical
  node test-runner.js --action=report
  node test-runner.js --action=all

Options:
  --category=<category>  - Run tests for specific category (authentication, dashboard, etc.)
  --priority=<priority>  - Run tests with specific priority (critical, high, medium, low)

Reports will be generated in: ${this.reportsDir}
Test files will be created in: ${this.testsDir}
`);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new FastenrTestRunner();
  runner.run().catch(console.error);
}

module.exports = FastenrTestRunner;