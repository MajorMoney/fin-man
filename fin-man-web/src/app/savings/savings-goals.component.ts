import { Component } from '@angular/core';

interface SavingsGoal {
  title: string;
  icon?: string;
  current: number;
  target: number;
  needed: number;
  daysLeft: number;
  monthlyContribution: number;
  color: string;
}

@Component({
  selector: 'app-savings-goals',
  templateUrl: './savings-goals.component.html',
  styleUrls: ['./savings-goals.component.css']
})
export class SavingsGoalsComponent {
  goals: SavingsGoal[] = [
    {
      title: 'Dream Home Down Payment',
      current: 75000,
      target: 250000,
      needed: 175000,
      daysLeft: 2100,
      monthlyContribution: 2500,
      color: '#3b82f6'
    },
    {
      title: 'European Adventure Fund',
      current: 3200,
      target: 8000,
      needed: 4800,
      daysLeft: 288,
      monthlyContribution: 500,
      color: '#06b6d4'
    },
    {
      title: 'New Car Purchase',
      current: 12000,
      target: 30000,
      needed: 18000,
      daysLeft: 540,
      monthlyContribution: 1000,
      color: '#10b981'
    },
    {
      title: "Children's College Fund",
      current: 45200,
      target: 150000,
      needed: 105000,
      daysLeft: 2100,
      monthlyContribution: 1500,
      color: '#f59e0b'
    },
    {
      title: 'Retirement Nest Egg',
      current: 180000,
      target: 1000000,
      needed: 820000,
      daysLeft: 6150,
      monthlyContribution: 4000,
      color: '#8b5cf6'
    },
    {
      title: 'Personal Development Course',
      current: 800,
      target: 1500,
      needed: 700,
      daysLeft: 140,
      monthlyContribution: 150,
      color: '#ec4899'
    }
  ];
}
