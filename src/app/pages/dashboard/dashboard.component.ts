import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
   Math = Math;
  constructor(private router: Router, private http: HttpClient) {}

  positions = [
    { symbol: 'NIFTY 24000 CE', type: 'CALL', qty: 50, ltp: 120.5, pnl: 1250, pnlPct: 12.5 },
    { symbol: 'BANKNIFTY 52000 PE', type: 'PUT', qty: 25, ltp: 89.3, pnl: -450, pnlPct: -4.2 },
    { symbol: 'RELIANCE 2800 CE', type: 'CALL', qty: 100, ltp: 45.2, pnl: 320, pnlPct: 3.1 },
    { symbol: 'NIFTY 23800 PE', type: 'PUT', qty: 75, ltp: 200.1, pnl: -890, pnlPct: -8.1 },
  ];

  // New order form
  newOrder = { symbol: 'NIFTY 24000 CE', tradeType: 'CALL', quantity: 50 };

  // Warning state
  showWarning = false;
  warningMessage = '';
  pastLosses = 0;
  totalLoss = 0;

  get totalPnl() { return this.positions.reduce((sum, p) => sum + p.pnl, 0); }
  get winningTrades() { return this.positions.filter(p => p.pnl > 0).length; }
  get losingTrades() { return this.positions.filter(p => p.pnl < 0).length; }

  checkAndPlaceOrder() {
    const userId = 1; // hardcoded for now
    this.http.post<any>('http://localhost:7071/api/CheckTradeRisk', {
      symbol: this.newOrder.symbol,
      tradeType: this.newOrder.tradeType,
      userId: userId
    }).subscribe({
      next: (res) => {
        if (res.hasRisk) {
          this.warningMessage = res.message;
          this.pastLosses = res.pastLosses;
          this.totalLoss = res.totalLoss;
          this.showWarning = true;
        } else {
          alert('✅ No risk detected! Order placed successfully.');
        }
      },
      error: () => {
        alert('Error checking trade risk.');
      }
    });
  }

  confirmOrder() {
    this.showWarning = false;
    alert('⚠️ Order placed despite warning. Be careful!');
  }

  cancelOrder() {
    this.showWarning = false;
  }

  logout() { this.router.navigate(['/login']); }
}