import { Component } from '@angular/core';

@Component({
  selector: 'app-detailed-transactions-placeholder',
  template: `<div class="transactions-card">
    <div class="card-header">
      <h2>Detailed Transactions</h2>
      <button class="more-options">⋮</button>
    </div>
    <div class="placeholder-content">
      <p><!-- Your existing transaction list component will go here --></p>
      <p class="placeholder-text">app-transaction-list component placeholder</p>
    </div>
  </div>`,
  styles: [
    `
      .transactions-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        height: fit-content;
      }

      .placeholder-content {
        padding: 40px 20px;
        text-align: center;
        color: #999;
        border: 2px dashed #e0e0e0;
        border-radius: 8px;
        background-color: #fafafa;
      }

      .placeholder-text {
        font-size: 14px;
        font-style: italic;
      }
    `,
  ],
})
export class DetailedTransactionsPlaceholderComponent {}
