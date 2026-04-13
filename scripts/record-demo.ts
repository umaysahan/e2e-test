import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Records a demo video of the full test suite showcase.
 *
 * Usage: npm run test:demo
 * Output: demo-recording/demo.webm
 */

const OUTPUT_DIR = 'demo-recording';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'demo.webm');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Run the demo test
console.log('Recording demo...\n');
try {
  execSync('npx playwright test tests/ui/demo.spec.ts --project=chromium --headed', {
    stdio: 'inherit',
  });
} catch {
  console.error('\nDemo test failed. Check the output above.');
  process.exit(1);
}

// Find the video file in test-results
const testResultsDir = 'test-results';
const videoFile = findFile(testResultsDir, 'video.webm');

if (videoFile) {
  fs.copyFileSync(videoFile, OUTPUT_FILE);
  const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\nDemo video saved: ${OUTPUT_FILE} (${sizeMB} MB)`);
  console.log('Upload this file to GitHub, LinkedIn, or your portfolio.');
} else {
  console.error('\nVideo file not found in test-results/');
  process.exit(1);
}

function findFile(dir: string, filename: string): string | null {
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(fullPath, filename);
      if (found) return found;
    } else if (entry.name === filename) {
      return fullPath;
    }
  }
  return null;
}
