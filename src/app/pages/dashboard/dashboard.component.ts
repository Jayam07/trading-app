import { Component, OnInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {

  Math = Math;

  constructor(private router: Router, private http: HttpClient) {}

  // Real trades from DB
  trades: any[] = [];
  loading = true;

  // New order form
  newOrder = { symbol: 'NIFTY 24000 CE', tradeType: 'CALL', quantity: 50 };

  // Warning state
  showWarning = false;
  warningMessage = '';
  pastLosses = 0;
  totalLoss = 0;

  get totalPnl() { return this.trades.reduce((sum, t) => sum + t.PnL, 0); }
  get winningTrades() { return this.trades.filter(t => t.PnL > 0).length; }
  get losingTrades() { return this.trades.filter(t => t.PnL < 0).length; }

  ngOnInit() {
    const userId = 1; // hardcoded for now
    this.http.get<any>(`http://localhost:7071/api/GetTrades?userId=${userId}`)
      .subscribe({
        next: (res) => {
          this.trades = res.trades;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  checkAndPlaceOrder() {
    const userId = 1;
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
  this.executeTrade();
}

  cancelOrder() {
    this.showWarning = false;
  }

  logout() { this.router.navigate(['/login']); }

  // Buy/Sell modal
showTradeModal = false;
tradeAction = 'BUY';
tradeForm = {
  symbol: 'NIFTY 24000 CE',
  tradeType: 'CALL',
  quantity: 50,
  entryPrice: 0
};
tradeSuccess = '';

openTradeModal(action: string) {
  this.tradeAction = action;
  this.showTradeModal = true;
  this.tradeSuccess = '';
}

closeTradeModal() {
  this.showTradeModal = false;
}

submitTrade() {
  this.http.post<any>('http://localhost:7071/api/CheckTradeRisk', {
    symbol: this.tradeForm.symbol,
    tradeType: this.tradeForm.tradeType,
    userId: 1
  }).subscribe({
    next: (riskRes) => {
      if (riskRes.hasRisk && this.tradeAction === 'BUY') {
        this.warningMessage = riskRes.message;
        this.pastLosses = riskRes.pastLosses;
        this.totalLoss = riskRes.totalLoss;
        this.showWarning = true;
        this.showTradeModal = false;
      } else {
        this.executeTrade();
      }
    },
    error: () => this.executeTrade()
  });
}

executeTrade() {
  this.http.post<any>('http://localhost:7071/api/PlaceTrade', {
    userId: 1,
    symbol: this.tradeForm.symbol,
    tradeType: this.tradeForm.tradeType,
    action: this.tradeAction,
    quantity: this.tradeForm.quantity,
    entryPrice: this.tradeForm.entryPrice
  }).subscribe({
    next: (res) => {
      if (res.success) {
        this.showTradeModal = false;
        this.ngOnInit(); // refresh trades
      }
    }
  });
}
}