import assert from 'node:assert';
import { pageIsPastWindow } from '../providers/workday.mjs';
import { pass, fail } from './helpers.mjs';

const EARLY_STOP_MARGIN_MS = 2 * 86_400_000; // Matching the actual value in workday.mjs

async function runTests() {
  console.log('🧪 Testing Workday early-stop logic...');

  try {
    // Case 1: All jobs are dated and stale -> Should STOP (true)
    const staleDated = [
      { postedAt: 100 },
      { postedAt: 200 }
    ];
    const sinceMs = 1000000000; // High enough to be way past the margin
    assert.strictEqual(pageIsPastWindow(staleDated, sinceMs), true, 'Should stop on purely stale dated jobs');
    pass('Case 1: Stops on purely stale dated jobs');

    // Case 2: All jobs are dated and fresh -> Should NOT stop (false)
    const freshDated = [
      { postedAt: 2000000000 },
      { postedAt: 2100000000 }
    ];
    assert.strictEqual(pageIsPastWindow(freshDated, sinceMs), false, 'Should not stop on fresh dated jobs');
    pass('Case 2: Does not stop on fresh dated jobs');

    // Case 3: Mixed dated (stale) and undated jobs -> Should STOP (true)
    // This matches scan.md: we stop based on the oldest dated posting, 
    // even if undated postings are present on the same page.
    const mixedJobs = [
      { postedAt: 100 },
      { postedAt: undefined }
    ];
    assert.strictEqual(pageIsPastWindow(mixedJobs, sinceMs), true, 'Should stop on mixed content (dated stale + undated)');
    pass('Case 3: Stops on mixed content (Dated stale + Undated)');

    // Case 4: All jobs are undated -> Should NOT stop (false)
    const allUndated = [
      { postedAt: undefined },
      { postedAt: undefined }
    ];
    assert.strictEqual(pageIsPastWindow(allUndated, sinceMs), false, 'Should not stop on purely undated jobs');
    pass('Case 4: Does not stop on purely undated jobs');

    console.log('\n🎉 All Workday early-stop tests passed!');
  } catch (err) {
    fail(`Test Failed: ${err.message}`);
    throw err;
  }
}

runTests();
