'use strict';
const { defaults, calculate } = window.PlumModel;
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const definitions = {
  available: ['Cash available per household ($)', 0, 2000000, 1000], monthlySavings: ['Monthly saving per household ($)', 0, 20000, 100],
  price: ['Purchase price ($)', 100000, 5000000, 5000], down: ['Down payment (%)', 0, 100, 1], rate: ['Loan interest rate (%)', 0, 20, 0.1], years: ['Amortization (years)', 5, 40, 1], closing: ['Closing costs ($)', 0, 200000, 1000], improvements: ['Improvements + furniture ($)', 0, 1000000, 1000], reserve: ['Starting cash reserve ($)', 0, 500000, 1000],
  peakRate: ['Weekly rent ($)', 0, 20000, 100], peakOcc: ['Occupancy (%)', 0, 100, 1], shoulderRate: ['Weekly rent ($)', 0, 20000, 100], shoulderOcc: ['Occupancy (%)', 0, 100, 1], offRate: ['Weekly rent ($)', 0, 20000, 100], offOcc: ['Occupancy (%)', 0, 100, 1],
  management: ['Management (% of rent)', 0, 50, 1], platform: ['Platform fees (% of rent)', 0, 30, 1], tax: ['Property tax / year ($)', 0, 100000, 500], insurance: ['Home + flood insurance / yr ($)', 0, 100000, 500], utilities: ['Utilities / year ($)', 0, 100000, 500], maintenance: ['Maintenance / year ($)', 0, 100000, 500], misc: ['Other annual costs ($)', 0, 100000, 500], capex: ['Annual capital reserve ($)', 0, 100000, 500]
};
function field(key, prefix = '') {
  const [label, min, max, step] = definitions[key];
  return `<div class="field"><label for="${key}">${prefix}${label}</label><input id="${key}" name="${key}" type="number" inputmode="decimal" min="${min}" max="${max}" step="any" data-step="${step}" required value="${defaults[key]}"></div>`;
}
$('budget-fields').innerHTML = ['available','monthlySavings'].map(k => field(k)).join('');
$('purchase-fields').innerHTML = ['price','down','rate','years','closing','improvements','reserve'].map(k => field(k)).join('');
$('expense-fields').innerHTML = ['management','platform','tax','insurance','utilities','maintenance','misc','capex'].map(k => field(k)).join('');
$('season-fields').innerHTML = [['peak','Peak summer','12 weeks before family use'],['shoulder','Shoulder','20 weeks'],['off','Off-season','20 weeks']].map(([key,name,description]) => `<div class="season"><div><b>${name}</b><small>${description}</small></div>${field(key+'Rate',`<span class="sr-only">${name} </span>`)}${field(key+'Occ',`<span class="sr-only">${name} </span>`)}</div>`).join('');
const style = document.createElement('style'); style.textContent = '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}'; document.head.appendChild(style);
function read() {
  const result = {};
  for (const key of Object.keys(defaults)) {
    const input = $(key);
    if (!input.validity.valid || input.value === '' || !Number.isFinite(Number(input.value))) return null;
    result[key] = Number(input.value);
  }
  return result;
}
function row(label, value, total = false) { return `<div class="row${total ? ' total' : ''}"><span>${label}</span><b>${value}</b></div>`; }
function update() {
  const s = read();
  $('error').hidden = !!s;
  $('outputs').setAttribute('aria-disabled', String(!s));
  if (!s) { $('error').textContent = 'Enter a valid number in each field. Results remain at the last valid scenario until the highlighted field is corrected.'; return; }
  const m = calculate(s), totalAvailable = s.available * 2, gap = Math.max(0, m.upfront - totalAvailable);
  $('family-count').textContent = `${s.family} total / ${s.family / 2} each`;
  $('family-impact').textContent = `At these assumptions, each extra family summer week gives up about ${money(m.familyCost)} of expected rental cash after percentage fees. Other costs remain. ${12 - s.family} peak weeks are available to rent.`;
  for (const id of ['each-upfront','seth-upfront','parents-upfront']) $(id).textContent = money(m.upfront / 2);
  $('funding-ledger').innerHTML = row('Cash available · both households',money(totalAvailable)) + row('Cash needed for this purchase',money(m.upfront));
  $('funding-gap').textContent = money(gap ? gap / 2 : (totalAvailable - m.upfront) / 2);
  $('funding-card').classList.toggle('positive', !gap);
  $('funding-description').textContent = gap ? 'More cash needed from each household before this purchase is funded.' : 'Cash left per household beyond the planned purchase and reserve. Financing and property economics still need verification.';
  $('savings-note').textContent = !gap ? 'The modeled upfront cash is covered.' : s.monthlySavings ? `Saving ${money(s.monthlySavings)} per month per household would close this gap in about ${Math.ceil(gap / (2 * s.monthlySavings))} months. Assumes unchanged costs, no investment return, and no property ownership costs before purchase.` : 'Add a monthly saving amount to see a simple funding timeline. No saving timeline is assumed at $0.';
  const uses = [m.downCash,s.closing,s.improvements,s.reserve], colors = ['#236a70','#f4c766','#ab4b31','#98b5ba'];
  $('upfront-bar').innerHTML = uses.map((amount,i) => `<span style="width:${m.upfront ? amount/m.upfront*100 : 0}%;background:${colors[i]}"></span>`).join('');
  $('upfront-ledger').innerHTML = ['Down payment','Closing costs','Improvements + furniture','Starting cash reserve'].map((label,i)=>row(label,money(uses[i]))).join('') + row('Total family cash',money(m.upfront),true);
  $('loan-note').textContent = `Plus ${money(m.loan)} borrowed. ${s.rate}% over ${s.years} years: ${money(m.monthly)} per month in principal + interest. Loan terms are hypothetical; a smaller down payment is not an approval.`;
  $('annual-ledger').innerHTML = row('Accommodation revenue',money(m.gross)) + row('Management + platform fees','−'+money(m.fees)) + row('Taxes, insurance & other operating costs','−'+money(m.fixed)) + row('Net operating income',money(m.gross-m.fees-m.fixed),true) + row('Principal + interest','−'+money(m.debt)) + row('Annual capital reserve set-aside','−'+money(s.capex)) + row(m.cash < 0 ? 'Annual cash shortfall' : 'Annual available cash',money(Math.abs(m.cash)),true);
  $('cash-card').classList.toggle('positive',m.cash>=0);
  $('cash-label').textContent = m.cash < 0 ? 'Each household contributes / year' : 'Each household could receive / year';
  $('each-cash').textContent = money(Math.abs(m.cash)/2);
  $('cash-description').textContent = `${money(Math.abs(m.cash)/24)} per month ${m.cash < 0 ? 'to budget, in addition to the upfront cash. Both households split the shortfall equally.' : 'on average, subject to keeping reserves funded and approving distributions.'}`;
  $('interpretation').textContent = `${gap ? `At ${money(s.available)} each, this purchase still needs ${money(gap/2)} more per household upfront. ` : 'Your stated cash covers the modeled upfront requirement. '}${m.cash<0 ? `After purchase, each household also budgets ${money(-m.cash/2)} a year to keep the reserve intact. ` : `After purchase, this scenario leaves ${money(m.cash/2)} per household annually before income tax. `}A better purchase price or stronger rentals can help; borrowing more to reduce upfront cash usually increases the ongoing carry.`;
  const scale = Math.max(m.peak,m.shoulder,m.off,1);
  $('season-chart').innerHTML = [['Peak summer',m.peak],['Shoulder',m.shoulder],['Off-season',m.off]].map(([name,value]) => `<div class="chartrow"><span>${name}</span><div class="track"><div class="fill" style="width:${value/scale*100}%"></div></div><b>${money(value)}</b></div>`).join('');
  $('break-even').textContent = money(m.breakEven);
  $('sensitivity').innerHTML = [[.8,'20% less rent'],[1,'Your scenario'],[1.2,'20% more rent']].map(([factor,label])=>{const cash=m.gross*factor*(1-m.feeRate)-m.fixed-m.debt-s.capex;return `<tr><td>${label}</td><td class="money">${money(m.gross*factor)}</td><td>${money(Math.abs(cash)/2)} ${cash<0?'contribution':'available'}</td></tr>`;}).join('');
  const savings = m.monthly - m.sellerMonthly;
  $('seller-ledger').innerHTML = row('Selected loan · monthly',money(m.monthly)) + row('Hypothetical 6% seller loan · monthly',money(m.sellerMonthly)) + row(savings>=0?'Monthly payment reduction':'Monthly payment increase',money(Math.abs(savings))) + row('Seller balloon due in year five',money(m.sellerBalance),true);
  $('equity-note').textContent = `With your selected loan, five years of scheduled payments repay ${money(m.principal5)} of principal, or ${money(m.principal5/2)} per household. The remaining loan balance would be ${money(m.balance5)}. This assumes payments are made and no extra borrowing.`;
  $('capital-paths').innerHTML = [[25,s.rate,'25% down · bank illustration'],[10,6,'10% down · seller illustration'],[0,6,'0% down · seller illustration']].map(([down,rate,label])=>{const c=calculate({...s,down,rate,years:down===25?s.years:30});return `<tr><td><strong>${label}</strong>${down!==25?`<small>Year-five balloon: ${money(c.sellerBalance)}</small>`:''}</td><td class="money">${money(c.upfront/2)}</td><td class="money">${money(Math.max(0,c.upfront/2-s.available))}</td><td>${money(Math.abs(c.cash)/2)} ${c.cash<0?'contribution':'available'}</td></tr>`;}).join('');
}
function restore(values) { for(const key of Object.keys(defaults)) $(key).value = values[key] ?? defaults[key]; update(); }
// Shared assumptions live in the URL fragment, so they are not sent in the HTTP request.
function loadScenario() {
  try {
    if (location.hash.startsWith('#scenario=')) {
      const parsed = JSON.parse(decodeURIComponent(location.hash.slice(10)));
      if (parsed && typeof parsed === 'object') restore(parsed);
    }
  } catch { $('status').textContent = 'Could not load shared assumptions; using the current scenario.'; }
}
loadScenario();
window.addEventListener('hashchange', loadScenario);
$('assumptions').addEventListener('input',()=>{ $('status').textContent=''; update(); });
$('assumptions').addEventListener('submit',e=>e.preventDefault());
$('reset').addEventListener('click',()=>{restore(defaults); history.replaceState(null,'',location.pathname+location.search+'#cash'); $('status').textContent='Starting example restored.';});
$('share').addEventListener('click',async()=>{const s=read();if(!s){$('status').textContent='Correct the highlighted inputs before sharing.';return;}const link=location.origin+location.pathname+'#scenario='+encodeURIComponent(JSON.stringify(s));try{await Promise.race([navigator.clipboard.writeText(link), new Promise((_, reject) => setTimeout(() => reject(new Error('Clipboard unavailable')), 2000))]);$('status').textContent='Scenario link copied.';}catch{history.replaceState(null,'',link);$('status').textContent='Scenario saved in the address bar. Copy that URL to share.';}});
$('print').addEventListener('click',()=>window.print());
update();
