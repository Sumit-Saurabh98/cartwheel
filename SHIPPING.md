# Shipping guide

Every change to Cartwheel is checked against this file before it is approved. Reviewers (people or agents) quote the rule number when they ask for changes.

## Rules

1. **Test first.** A bug fix adds a test that fails on `main` and passes with the fix. The PR body shows both runs (before and after).
2. **Money is exact.** Do money math in integer cents and round half-up to the cent once, at the end. Assert money with exact number equality, such as `expect(body.total).toBe(43.87)`. Never use `toBeCloseTo` or `toFixed` in money assertions: both hide float errors like `43.870000000000005`.
3. **Keep the API contract.** Don't rename or remove response fields. A new field or behaviour change needs a line in the PR body under "API impact".
4. **Small and focused.** One loop / one issue per PR. No drive-by refactors, formatting churn or new dependencies unless the fix needs them, and say why.
5. **Green CI.** `npm test` passes in GitHub Actions. Never approve on red or pending.
6. **Explain it plainly.** The PR title is `fix: <summary> (LOOP-n)`, and the body starts with `Closes #<issue>`, then cause, fix, and test evidence.
7. **No secrets, no customer data** in code, tests, fixtures or PR text.
8. **Humans merge.** An agent may recommend approval but merges only after the maintainer writes `approve LOOP-n` in the team room.
