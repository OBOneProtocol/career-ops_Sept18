import assert from 'node:assert';
import { pageIsPastWindow } from '../providers/workday.mjs';

const EARLY_STOP_MARGIN_MS = 2 * 86_400_000; // Matching the actual value in workday.mjs

async function runTests() {
  console.log('🧪 Testing Workday early-stop logic...');

  // Case 1: All jobs are dated and stale -> Should STOP (true)
  const staleDated = [
    { postedAt: 100 },
    { postedAt: 200 }
  ];
  const sinceMs = 1000000000; // High enough to be way past the margin
  assert.strictEqual(pageIsPastWindow(staleDated, sinceMs), true, 'Should stop on purely stale dated jobs');
  console.log('✅ Case 1 Passed: Stops on purely stale dated jobs');

  // Case 2: All jobs are dated and fresh -> Should NOT stop (false)
  const freshDated = [
    { postedAt: 2000000000 },
    { postedAt: 2100000000 }
  ];
  assert.strictEqual(pageIsPastWindow(freshDated, sinceMs), false, 'Should not stop on fresh dated jobs');
  console.log('✅ Case 2 Passed: Does not stop on fresh dated jobs');

  // Case 3: Mixed dated (stale) and undated jobs -> Should NOT stop (false)
  // This is the bug fix: we must not stop if undated jobs are present.
  const mixedJobs = [
    { postedAt: 100 },
    { postedAt: undefined }
  ];
  assert.strictEqual(pageIsPastWindow(mixedJobs, sinceMs), false, 'Should not stop on mixed content (dated stale + undated)');
  console.log('✅ Case 3 Passed: Does not stop on mixed content (Bug Fix Verified)');

  // Case 4: All jobs are undated -> Should NOT stop (false)
  const allUndated = [
    { postedAt: undefined },
    { postedAt: undefined }
  ];
  assert.strictEqual(pageIsPastWindow(allUndated, sinceMs), false, 'Should not stop on purely undated jobs');
  console.log('✅ Case 4 Passed: Does not stop on purely undated jobs');

  console.log('\n🎉 All Workday early-stop tests passed!');
}

runTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
