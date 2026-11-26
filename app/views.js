// Page templates for Hearthledger. Each function returns the HTML for one page of the
// household budget site, built entirely from store.js figures. Controls carry
// data-action attributes; main.js listens for them and re-renders, so every button,
// form and filter on these pages does what its label says.

import { donutChart, progressBar, shareBars, toneForPercent, trendChart } from './charts.js';
import { HOUSEHOLD, MONTH_LABEL, TODAY } from './data.js';
import {
  averageDailySpending,
  billsDueTotal,
  categoryRows,
  daysLeftInMonth,
  filterTransactions,
  goalFinishLabel,
  goalMonthsLeft,
  groupTotals,
  largestCategory,
  leftToAllocate,
  money,
  moneyWhole,
  monthElapsedPercent,
  monthlySavings,
  overspentCategories,
  paceWarnings,
  percent,
  projectedMonthEndSpending,
  recentTransactions,
  savingsRate,
  state,
  subscriptionTotal,
  totalIncome,
  totalPlanned,
  totalSpending,
  trendRows,
  upcomingBills,
  whatIf,
} from './store.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function formatDate(iso) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, month, day] = iso.split('-');
  return `${Number(day)} ${names[Number(month) - 1]}`;
}

function transactionRow(t, withDelete) {
  const sign = t.type === 'income' ? '+' : '−';
  const amountClass = t.type === 'income' ? 'amount-in' : 'amount-out';
  const del = withDelete
    ? `<button type="button" class="btn btn-quiet" data-action="delete-transaction" data-id="${t.id}">Delete</button>`
    : '';
  return `<tr>
    <td class="cell-date">${formatDate(t.date)}</td>
    <td><span class="tx-desc">${escapeHtml(t.description)}</span><span class="tx-meta">${escapeHtml(t.account)} · ${escapeHtml(t.member)}</span></td>
    <td>${escapeHtml(t.category)}</td>
    <td class="cell-amount ${amountClass}">${sign}${money(t.amount)}</td>
    <td class="cell-action">${del}</td>
  </tr>`;
}

function categoryOptions(selected) {
  return state.categories
    .map((c) => `<option value="${escapeHtml(c.name)}"${c.name === selected ? ' selected' : ''}>${escapeHtml(c.name)}</option>`)
    .join('');
}

function addTransactionForm() {
  const accounts = HOUSEHOLD.accounts.map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
  const members = [...HOUSEHOLD.members, 'Household']
    .map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`)
    .join('');
  return `<form class="card form-card" data-form="add-transaction">
  <h3>Add a transaction</h3>
  <div class="form-grid">
    <label>Description <input name="description" required maxlength="80" placeholder="e.g. Weekly groceries"></label>
    <label>Amount ($) <input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
    <label>Type <select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label>
    <label>Category <select name="category">${categoryOptions('Groceries')}<option value="Income">Income</option></select></label>
    <label>Date <input name="date" type="date" value="${TODAY}" min="2026-11-01" max="2026-11-30" required></label>
    <label>Account <select name="account">${accounts}</select></label>
    <label>Member <select name="member">${members}</select></label>
  </div>
  <button type="submit" class="btn btn-primary">Add transaction</button>
  <p class="form-note">Totals, charts and budgets update as soon as you add it.</p>
</form>`;
}

export function dashboardPage() {
  const income = totalIncome();
  const spending = totalSpending();
  const rows = categoryRows();
  const warnings = paceWarnings();
  const over = overspentCategories();
  const due = upcomingBills();
  const slices = rows.map((r) => ({ label: r.name, value: Math.round(r.spent), color: r.color }));
  const legend = rows
    .map(
      (r) => `<li><span class="swatch" style="background:${r.color}"></span>${escapeHtml(r.name)} <strong>${money(r.spent)}</strong> <span class="muted">${percent(r.spent, spending)}%</span></li>`,
    )
    .join('');
  const topBudgets = [...rows]
    .sort((a, b) => b.usedPercent - a.usedPercent)
    .slice(0, 5)
    .map(
      (r) => `<div class="budget-line">
      <span class="budget-name"><span class="swatch" style="background:${r.color}"></span>${escapeHtml(r.name)}</span>
      ${progressBar(r.usedPercent, toneForPercent(r.usedPercent))}
      <span class="budget-figures">${money(r.spent)} of ${moneyWhole(r.planned)} · ${r.usedPercent}%</span>
    </div>`,
    )
    .join('');
  const recent = recentTransactions(6).map((t) => transactionRow(t, false)).join('');
  const healthNotes = [];
  if (over.length) {
    healthNotes.push(
      `${over.map((r) => escapeHtml(r.name)).join(', ')} ${over.length === 1 ? 'is' : 'are'} over budget — see the <a href="#/budget">Budget page</a> to adjust the plan.`,
    );
  }
  for (const w of warnings.slice(0, 2)) {
    healthNotes.push(
      `${escapeHtml(w.name)} is at ${w.usedPercent}% of its budget with ${daysLeftInMonth()} days left in ${MONTH_LABEL.split(' ')[0]} — ${money(w.remaining)} to go.`,
    );
  }
  if (!healthNotes.length) {
    healthNotes.push(`Every category is pacing at or under the calendar (${monthElapsedPercent()}% of the month gone).`);
  }
  healthNotes.push(
    `At the current pace of ${money(averageDailySpending())} a day, November spending lands near ${moneyWhole(projectedMonthEndSpending())} against ${moneyWhole(totalPlanned())} planned.`,
  );
  const goalSpotlight = state.goals
    .map(
      (g) => `<div class="goal-line">
      <span class="goal-name">${escapeHtml(g.name)}</span>
      ${progressBar(percent(g.saved, g.target), 'ok')}
      <span class="goal-figures">${moneyWhole(g.saved)} of ${moneyWhole(g.target)} · ${percent(g.saved, g.target)}%</span>
    </div>`,
    )
    .join('');
  const billsLine = due.length
    ? due.map((b) => `${escapeHtml(b.name)} ${money(b.amount)} due ${b.dueDay} Nov`).join(' · ')
    : 'Nothing left to pay this month.';
  return `<section class="page-head">
  <div>
    <h1>${MONTH_LABEL} at a glance</h1>
    <p class="lede">${escapeHtml(HOUSEHOLD.name)} · day 26 of 30 · ${daysLeftInMonth()} days left in the month.</p>
  </div>
  <a class="btn btn-primary" href="#/ledger">Open the ledger</a>
</section>
<section class="stat-grid" aria-label="Month totals">
  <div class="stat-card"><span class="stat-label">Income in</span><span class="stat-value">${money(income)}</span><span class="stat-note">Two salaries, freelance work and interest</span></div>
  <div class="stat-card"><span class="stat-label">Spent so far</span><span class="stat-value">${money(spending)}</span><span class="stat-note">${percent(spending, totalPlanned())}% of the ${moneyWhole(totalPlanned())} plan</span></div>
  <div class="stat-card"><span class="stat-label">Saved this month</span><span class="stat-value">${moneyWhole(monthlySavings())}</span><span class="stat-note">${savingsRate()}% of income, across ${state.goals.length} goals</span></div>
  <div class="stat-card"><span class="stat-label">Still to allocate</span><span class="stat-value">${money(leftToAllocate())}</span><span class="stat-note">After spending and savings, before month-end bills</span></div>
</section>
<div class="two-col">
  <section class="card">
    <h2>Where the money went</h2>
    <div class="donut-wrap">${donutChart(slices, 'spent', moneyWhole(spending))}<ul class="legend">${legend}</ul></div>
  </section>
  <section class="card">
    <h2>Budgets under pressure</h2>
    ${topBudgets}
    <p><a href="#/budget">See every budget</a></p>
    <h2 class="subhead">Budget health</h2>
    <ul class="notes">${healthNotes.map((n) => `<li>${n}</li>`).join('')}</ul>
  </section>
</div>
<div class="two-col">
  <section class="card">
    <h2>Recent activity</h2>
    <table class="tx-table"><tbody>${recent || '<tr><td>No transactions yet this month — add the first one on the <a href="#/ledger">Ledger page</a>.</td></tr>'}</tbody></table>
    <p><a href="#/ledger">All ${state.transactions.length} transactions</a></p>
  </section>
  <section class="card">
    <h2>Savings goals</h2>
    ${goalSpotlight}
    <p><a href="#/goals">Manage goals</a></p>
    <h2 class="subhead">Still to pay</h2>
    <p>${billsLine}</p>
    <p><a href="#/bills">Bills &amp; subscriptions</a> · ${money(billsDueTotal())} due before month end</p>
  </section>
</div>`;
}

export function budgetPage() {
  const rows = categoryRows();
  const groups = groupTotals();
  const body = rows
    .map(
      (r) => `<tr>
      <td><span class="swatch" style="background:${r.color}"></span>${escapeHtml(r.name)}<span class="tx-meta">${r.group === 'needs' ? 'Need' : 'Want'}</span></td>
      <td>${money(r.spent)}</td>
      <td><form class="inline-form" data-form="set-planned" data-category="${escapeHtml(r.name)}"><label class="visually-hidden" for="planned-${escapeHtml(r.name)}">Planned for ${escapeHtml(r.name)}</label><input id="planned-${escapeHtml(r.name)}" name="planned" type="number" min="0" step="10" value="${r.planned}"><button type="submit" class="btn btn-small">Save</button></form></td>
      <td class="${r.remaining < 0 ? 'amount-out' : ''}">${r.remaining < 0 ? '−' : ''}${money(Math.abs(r.remaining))}${r.remaining < 0 ? ' over' : ' left'}</td>
      <td class="cell-progress">${progressBar(r.usedPercent, toneForPercent(r.usedPercent))}<span>${r.usedPercent}%</span></td>
    </tr>`,
    )
    .join('');
  return `<section class="page-head">
  <div><h1>Budget planner</h1>
  <p class="lede">Planned ${moneyWhole(totalPlanned())} against ${money(totalIncome())} of income. Change any planned amount and save — progress, pace warnings and the dashboard follow.</p></div>
</section>
<section class="card">
  <table class="budget-table">
    <thead><tr><th>Category</th><th>Spent</th><th>Planned ($)</th><th>Remaining</th><th>Used</th></tr></thead>
    <tbody>${body}</tbody>
    <tfoot><tr><th>Total</th><th>${money(totalSpending())}</th><th>${moneyWhole(totalPlanned())}</th><th>${money(totalPlanned() - totalSpending())} left</th><th>${percent(totalSpending(), totalPlanned())}%</th></tr></tfoot>
  </table>
</section>
<section class="card">
  <h2>The 50/30/20 check</h2>
  <p>A common rule of thumb: about 50% of take-home pay on needs, 30% on wants, 20% saved. Here is this household against it, from November's real figures.</p>
  ${shareBars([
    { label: 'Needs', value: groups.needs, color: '#0f766e', display: `${money(groups.needs)} · ${groups.needsPercent}% (aim 50%)` },
    { label: 'Wants', value: groups.wants, color: '#d97706', display: `${money(groups.wants)} · ${groups.wantsPercent}% (aim 30%)` },
    { label: 'Saved', value: groups.saved, color: '#2563eb', display: `${money(groups.saved)} · ${groups.savedPercent}% (aim 20%)` },
  ])}
  <p class="notes-line">Needs are ${groups.needsPercent <= 50 ? 'inside' : 'above'} the 50% guide and wants are well under 30%, so the gap to a 20% savings rate is about ${moneyWhole(Math.max(0, totalIncome() * 0.2 - groups.saved))} a month — the <a href="#/insights">Insights page</a> shows what closing it would take.</p>
</section>`;
}

export function ledgerPage(filters) {
  const rows = filterTransactions(filters);
  const inTotal = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const outTotal = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const body = rows.map((t) => transactionRow(t, true)).join('');
  return `<section class="page-head">
  <div><h1>Ledger</h1>
  <p class="lede">Every November transaction. Search, filter, add or delete — the totals under the table always describe what is shown.</p></div>
</section>
${addTransactionForm()}
<section class="card">
  <form class="filter-bar" data-form="filter-ledger">
    <label>Search <input name="query" value="${escapeHtml(filters.query || '')}" placeholder="groceries, Priya, card…"></label>
    <label>Category <select name="category"><option value="All">All categories</option>${categoryOptions(filters.category)}<option value="Income"${filters.category === 'Income' ? ' selected' : ''}>Income</option></select></label>
    <label>Type <select name="type"><option value="All">All types</option><option value="expense"${filters.type === 'expense' ? ' selected' : ''}>Expenses</option><option value="income"${filters.type === 'income' ? ' selected' : ''}>Income</option></select></label>
    <button type="submit" class="btn">Apply filters</button>
    <a class="btn btn-quiet" href="#/ledger">Clear</a>
  </form>
  <table class="tx-table">
    <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead>
    <tbody>${body || '<tr><td colspan="5">No transactions match those filters. Try a shorter search, or <a href="#/ledger">clear the filters</a> to see the whole month.</td></tr>'}</tbody>
  </table>
  <p class="ledger-totals">Showing ${rows.length} of ${state.transactions.length} · in <strong class="amount-in">${money(inTotal)}</strong> · out <strong class="amount-out">${money(outTotal)}</strong> · net <strong>${money(inTotal - outTotal)}</strong></p>
</section>`;
}

export function goalsPage() {
  const cards = state.goals
    .map((g) => {
      const pct = percent(g.saved, g.target);
      const months = goalMonthsLeft(g);
      return `<article class="card goal-card">
      <h3>${escapeHtml(g.name)}</h3>
      <p class="goal-note">${escapeHtml(g.note)}</p>
      ${progressBar(pct, 'ok')}
      <p class="goal-figures"><strong>${moneyWhole(g.saved)}</strong> of ${moneyWhole(g.target)} · ${pct}% · ${moneyWhole(g.target - g.saved)} to go</p>
      <p class="goal-figures">Saving ${moneyWhole(g.monthly)}/month · ${months === 0 ? 'goal reached' : `on track for ${goalFinishLabel(g)} (${months} more ${months === 1 ? 'month' : 'months'})`}</p>
      <form class="inline-form" data-form="contribute" data-id="${g.id}">
        <label class="visually-hidden" for="contrib-${g.id}">Add to ${escapeHtml(g.name)}</label>
        <input id="contrib-${g.id}" name="amount" type="number" min="1" step="1" placeholder="$ to add" required>
        <button type="submit" class="btn btn-small">Add</button>
      </form>
    </article>`;
    })
    .join('');
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `<section class="page-head">
  <div><h1>Savings goals</h1>
  <p class="lede">${moneyWhole(totalSaved)} saved toward ${moneyWhole(totalTarget)} of goals · ${moneyWhole(monthlySavings())} a month across ${state.goals.length} goals (${savingsRate()}% of income).</p></div>
</section>
<div class="goal-grid">${cards}</div>
<form class="card form-card" data-form="add-goal">
  <h3>Start a new goal</h3>
  <div class="form-grid">
    <label>Goal name <input name="name" required maxlength="60" placeholder="e.g. New bikes"></label>
    <label>Target ($) <input name="target" type="number" min="10" step="10" required placeholder="1000"></label>
    <label>Monthly saving ($) <input name="monthly" type="number" min="1" step="1" required placeholder="100"></label>
    <label>Note <input name="note" maxlength="90" placeholder="What is it for?"></label>
  </div>
  <button type="submit" class="btn btn-primary">Add goal</button>
  <p class="form-note">A new goal joins the monthly savings total straight away, so the savings rate and the 50/30/20 check move with it.</p>
</form>`;
}

export function billsPage() {
  const sorted = [...state.bills].sort((a, b) => a.dueDay - b.dueDay);
  const rows = sorted
    .map((b) => {
      const action =
        b.status === 'paid'
          ? `<button type="button" class="btn btn-small btn-quiet" data-action="bill-upcoming" data-id="${b.id}">Mark unpaid</button>`
          : `<button type="button" class="btn btn-small" data-action="bill-paid" data-id="${b.id}">Mark paid</button>`;
      const status =
        b.status === 'paid' ? `<span class="pill pill-paid">Paid ${formatDate(b.paidOn)}</span>` : `<span class="pill pill-due">Due ${b.dueDay} Nov</span>`;
      return `<tr><td>${escapeHtml(b.name)}<span class="tx-meta">${escapeHtml(b.account)}</span></td><td>${b.dueDay} Nov</td><td>${money(b.amount)}</td><td>${status}</td><td class="cell-action">${action}</td></tr>`;
    })
    .join('');
  const paidTotal = state.bills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  return `<section class="page-head">
  <div><h1>Bills &amp; subscriptions</h1>
  <p class="lede">${money(paidTotal)} already paid in November · ${money(billsDueTotal())} still due before the month ends. Marking a bill paid updates the dashboard's “still to pay” line.</p></div>
</section>
<section class="card">
  <table class="tx-table">
    <thead><tr><th>Bill</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="ledger-totals">Subscriptions inside these bills total ${money(subscriptionTotal())} a month (${moneyWhole(subscriptionTotal() * 12)} a year): streaming bundle, music app and cloud storage.</p>
</section>`;
}

export function insightsPage(whatIfInput) {
  const rows = categoryRows().sort((a, b) => b.spent - a.spent);
  const largest = largestCategory();
  const result = whatIf(whatIfInput.category, whatIfInput.trim, whatIfInput.extra);
  const dining = rows.find((r) => r.name === 'Dining Out');
  const groceries = rows.find((r) => r.name === 'Groceries');
  const remainingBudget = totalPlanned() - totalSpending();
  const daysLeft = daysLeftInMonth();
  const safeDailyAllowance = daysLeft > 0 ? remainingBudget / daysLeft : 0;
  const projectedGap = totalPlanned() - projectedMonthEndSpending();
  return `<section class="page-head">
  <div><h1>Insights</h1>
  <p class="lede">Six months of the household's money, and what November's own numbers suggest.</p></div>
</section>
<section class="card">
  <h2>Income, spending and savings — June to November</h2>
  ${trendChart(trendRows())}
  <p>November is computed from the live ledger (${money(totalIncome())} in, ${money(totalSpending())} out so far); earlier months are the household's recorded totals. Savings have risen from $950 in June to ${moneyWhole(monthlySavings())} this month.</p>
</section>
<div class="two-col">
  <section class="card">
    <h2>November by category</h2>
    ${shareBars(rows.map((r) => ({ label: r.name, value: r.spent, color: r.color, display: `${money(r.spent)} · ${percent(r.spent, totalSpending())}%` })))}
  </section>
  <section class="card">
    <h2>What the numbers say</h2>
    <ul class="notes">
      <li>${escapeHtml(largest.name)} is the biggest line at ${money(largest.spent)} — ${percent(largest.spent, totalSpending())}% of all spending, and ${largest.usedPercent}% of its budget.</li>
      <li>Groceries run ${money(groceries.spent)} across five shops, about ${money(groceries.spent / 5)} a shop; ${money(groceries.remaining)} of the ${moneyWhole(groceries.planned)} budget remains for the last ${daysLeftInMonth()} days.</li>
      <li>Dining out is ${money(dining.spent)} so far (${dining.usedPercent}% of budget) — the calmest “want” this month, while shopping is at ${rows.find((r) => r.name === 'Shopping').usedPercent}%.</li>
      <li>Subscriptions cost ${money(subscriptionTotal())} a month, ${moneyWhole(subscriptionTotal() * 12)} a year — small, but the easiest line to trim.</li>
      <li>Average daily spending is ${money(averageDailySpending())}; holding that pace ends November near ${moneyWhole(projectedMonthEndSpending())}, under the ${moneyWhole(totalPlanned())} plan.</li>
      <li>${remainingBudget >= 0 ? `${money(remainingBudget)} of the plan remains for the last ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} — about ${money(safeDailyAllowance)} a day keeps spending inside the plan, and the current pace projects ${moneyWhole(Math.abs(projectedGap))} ${projectedGap >= 0 ? 'under' : 'over'} plan at month end.` : `Spending is already ${money(Math.abs(remainingBudget))} past the plan with ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left, so any further spending widens the gap.`}</li>
    </ul>
  </section>
</div>
<section class="card">
  <h2>What if…?</h2>
  <p>Trim one category and add a flat extra saving, and see the effect on the savings rate. The figures use November's actual spending in the category you pick.</p>
  <form class="filter-bar" data-form="what-if">
    <label>Trim category <select name="category">${categoryOptions(whatIfInput.category)}</select></label>
    <label>Trim by (%) <input name="trim" type="number" min="0" max="90" step="5" value="${whatIfInput.trim}"></label>
    <label>Extra saving ($/month) <input name="extra" type="number" min="0" step="10" value="${whatIfInput.extra}"></label>
    <button type="submit" class="btn btn-primary">Recalculate</button>
  </form>
  <p class="whatif-result">Trimming ${escapeHtml(whatIfInput.category)} (${money(result.spent)} in November) by ${whatIfInput.trim}% frees ${money(result.trimmed)} a month. With ${moneyWhole(whatIfInput.extra)} of extra saving, that is <strong>${money(result.monthlyGain)} a month</strong> — ${moneyWhole(result.yearlyGain)} a year — lifting the savings rate from ${savingsRate()}% to <strong>${result.newSavingsRate}%</strong>.</p>
</section>`;
}

export function missingPage() {
  return `<section class="card"><h1>Page not found</h1><p>That page is not part of Hearthledger. <a href="#/">Back to the dashboard</a>.</p></section>`;
}
