/**
 * printBill — opens a formatted sales receipt in a new tab using a Blob URL.
 * Works reliably in Chrome/Edge without document.write() popup restrictions.
 *
 * @param {object} opts
 * @param {number|string} opts.billId        - Sale / Bill ID
 * @param {string}        opts.cashier       - Cashier username
 * @param {string}        opts.dateStr       - ISO date string or null
 * @param {Array}         opts.items         - Array of { name, quantity, price/unitPrice, taxRate? }
 * @param {string}        opts.paymentMethod - e.g. 'CASH'
 * @param {string}        opts.status        - e.g. 'COMPLETED'
 * @param {object}        opts.currency      - CurrencyContext currency object { code, name, symbol, rate, taxRate, taxLabel }
 * @param {function}      opts.formatAmount  - formatAmount(usdValue) → formatted string
 */
export function printBill({ billId, cashier, dateStr, items = [], paymentMethod, status, currency, formatAmount }) {
  const countryTaxRate  = currency?.taxRate  ?? 0;
  const countryTaxLabel = currency?.taxLabel ?? 'Tax';

  const subtotUSD     = items.reduce((s, i) => s + Number(i.price ?? i.unitPrice ?? 0) * Number(i.quantity), 0);
  const countryTaxAmt = subtotUSD * (countryTaxRate / 100);
  const grandTotal    = subtotUSD + countryTaxAmt;

  const itemRows = items.map(i => {
    const unitUSD    = Number(i.price ?? i.unitPrice ?? 0);
    const lineUSD    = unitUSD * Number(i.quantity);
    const itemTaxUSD = lineUSD * (countryTaxRate / 100);
    return `
      <tr>
        <td class="cell">${i.name ?? i.productName ?? 'Item'}</td>
        <td class="cell center">${i.quantity}</td>
        <td class="cell right">${formatAmount(unitUSD)}</td>
        <td class="cell right">${formatAmount(itemTaxUSD / Number(i.quantity))}</td>
        <td class="cell right bold">${formatAmount(lineUSD + itemTaxUSD)}</td>
      </tr>`;
  }).join('');

  const dateDisplay = dateStr
    ? new Date(dateStr).toLocaleString()
    : new Date().toLocaleString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bill #${billId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      background: #fff;
      color: #111;
      padding: 28px 24px;
      max-width: 480px;
      margin: 0 auto;
      font-size: 13px;
    }
    .store-name {
      text-align: center;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .sub {
      text-align: center;
      color: #555;
      font-size: 11px;
      margin-bottom: 3px;
    }
    hr { border: none; border-top: 2px dashed #aaa; margin: 10px 0; }
    hr.thin { border-top: 1px dashed #ccc; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 5px 3px;
      border-bottom: 2px solid #222;
      text-align: right;
    }
    th:first-child { text-align: left; }
    .cell { padding: 5px 3px; border-bottom: 1px dashed #ddd; vertical-align: top; }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: bold; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
      font-size: 13px;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      background: #111;
      color: #fff;
      padding: 8px 10px;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      margin-top: 6px;
    }
    .badge {
      display: inline-block;
      background: #222;
      color: #fff;
      padding: 2px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }
    .tax-note { font-size: 10px; color: #888; margin-top: 6px; }
    .footer {
      text-align: center;
      margin-top: 18px;
      font-size: 11px;
      color: #666;
      line-height: 1.8;
    }
    @media print {
      body { padding: 8px; }
      @page { margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="store-name">&#x1F9FE; POS Store</div>
  <p class="sub">SALES RECEIPT</p>
  <p class="sub">Bill #${billId}${cashier ? ' &nbsp;|&nbsp; Cashier: ' + cashier : ''}</p>
  <p class="sub">${dateDisplay}</p>
  <p class="sub">Currency: ${currency?.name ?? 'USD'} (${currency?.code ?? 'USD'})</p>
  <hr/>

  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:center">Qty</th>
        <th>Unit</th>
        <th>${countryTaxLabel}<br/>(${countryTaxRate}%)</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <hr class="thin"/>

  <div class="summary-row">
    <span>Subtotal (excl. tax)</span>
    <span>${formatAmount(subtotUSD)}</span>
  </div>
  <div class="summary-row">
    <span>${countryTaxLabel} @ ${countryTaxRate}%</span>
    <span>${formatAmount(countryTaxAmt)}</span>
  </div>
  <p class="tax-note">* ${countryTaxLabel} applied per ${currency?.name ?? ''} tax regulations</p>

  <hr/>

  <div class="grand-total">
    <span>GRAND TOTAL</span>
    <span>${formatAmount(grandTotal)}</span>
  </div>

  <br/>
  <div class="summary-row">
    <span>Payment Method</span>
    <span class="badge">${paymentMethod ?? '—'}</span>
  </div>
  <div class="summary-row">
    <span>Status</span>
    <span class="badge">${status ?? '—'}</span>
  </div>

  <div class="footer">
    <hr class="thin" style="margin:14px 0"/>
    <p>&#x2764; Thank you for your purchase!</p>
    <p>All prices in ${currency?.code ?? 'USD'} &nbsp;&bull;&nbsp; Rate: 1 USD = ${currency?.rate ?? 1} ${currency?.code ?? 'USD'}</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  // Use Blob URL — works in Chrome without popup/document.write restrictions
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) {
    // Fallback: download as HTML file if popup blocked
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${billId}.html`;
    a.click();
  }
  // Revoke after 60 seconds
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
