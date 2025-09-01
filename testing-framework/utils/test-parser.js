const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Parses the master test plan CSV and categorizes tests by automation level
 */
class TestParser {
  constructor(csvPath) {
    this.csvPath = csvPath;
    this.testCases = [];
    this.automatedTests = [];
    this.manualTests = [];
    this.mixedTests = [];
  }

  /**
   * Parse CSV file and categorize tests
   */
  async parseTestPlan() {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on('data', (data) => {
          // Clean and normalize the data
          const testCase = {
            area: data.Area?.trim(),
            page: data['Page/Component']?.trim(),
            testId: data['Test Case ID']?.trim(),
            feature: data['Feature/Function']?.trim(),
            elementType: data['Element Type']?.trim(),
            description: data['Test Description']?.trim(),
            expectedResult: data['Expected Result']?.trim(),
            priority: data.Priority?.trim(),
            notes: data.Notes?.trim(),
            status: data.Status?.trim() || 'pending',
            automationLevel: this.determineAutomationLevel(data)
          };
          
          if (testCase.testId) { // Only include rows with test IDs
            results.push(testCase);
          }
        })
        .on('end', () => {
          this.testCases = results;
          this.categorizeTests();
          resolve(this.testCases);
        })
        .on('error', reject);
    });
  }

  /**
   * Determine automation level based on test characteristics
   */
  determineAutomationLevel(testData) {
    const elementType = testData['Element Type']?.toLowerCase() || '';
    const description = testData['Test Description']?.toLowerCase() || '';
    const feature = testData['Feature/Function']?.toLowerCase() || '';

    // Fully automatable tests
    if (
      elementType.includes('form') ||
      elementType.includes('button') ||
      elementType.includes('navigation') ||
      elementType.includes('link') ||
      elementType.includes('dropdown') ||
      elementType.includes('checkbox') ||
      description.includes('login') ||
      description.includes('signup') ||
      description.includes('redirect') ||
      description.includes('create') ||
      description.includes('edit') ||
      description.includes('delete') ||
      description.includes('save') ||
      description.includes('validation')
    ) {
      return 'automated';
    }

    // Manual only tests
    if (
      elementType.includes('visual') ||
      description.includes('display correctly') ||
      description.includes('visual') ||
      description.includes('design') ||
      description.includes('layout') ||
      description.includes('color') ||
      description.includes('theme') ||
      feature.includes('user experience')
    ) {
      return 'manual';
    }

    // Mixed tests (can be partially automated)
    if (
      elementType.includes('chart') ||
      elementType.includes('table') ||
      elementType.includes('modal') ||
      description.includes('chart') ||
      description.includes('analytics') ||
      description.includes('report')
    ) {
      return 'mixed';
    }

    // Default to mixed for uncertain cases
    return 'mixed';
  }

  /**
   * Categorize tests by automation level
   */
  categorizeTests() {
    this.automatedTests = this.testCases.filter(test => test.automationLevel === 'automated');
    this.manualTests = this.testCases.filter(test => test.automationLevel === 'manual');
    this.mixedTests = this.testCases.filter(test => test.automationLevel === 'mixed');
  }

  /**
   * Generate test file names based on test case IDs
   */
  generateTestFileName(testCase) {
    const area = testCase.area.toLowerCase().replace(/\s+/g, '-');
    const testId = testCase.testId.toLowerCase();
    return `${area}-${testId}.spec.js`;
  }

  /**
   * Get automation statistics
   */
  getAutomationStats() {
    return {
      total: this.testCases.length,
      automated: this.automatedTests.length,
      manual: this.manualTests.length,
      mixed: this.mixedTests.length,
      automationPercentage: Math.round((this.automatedTests.length / this.testCases.length) * 100)
    };
  }

  /**
   * Export categorized tests to separate CSV files
   */
  async exportCategorizedTests(outputDir) {
    const categories = [
      { name: 'automated', tests: this.automatedTests },
      { name: 'manual', tests: this.manualTests },
      { name: 'mixed', tests: this.mixedTests }
    ];

    for (const category of categories) {
      const csvContent = this.convertToCSV(category.tests);
      const filePath = path.join(outputDir, `${category.name}-tests.csv`);
      fs.writeFileSync(filePath, csvContent);
    }
  }

  /**
   * Convert test cases array to CSV format
   */
  convertToCSV(testCases) {
    if (testCases.length === 0) return '';

    const headers = Object.keys(testCases[0]).join(',');
    const rows = testCases.map(test => 
      Object.values(test).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}

module.exports = TestParser;