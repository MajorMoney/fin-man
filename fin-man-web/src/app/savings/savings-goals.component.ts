import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SavingsGoal } from 'src/libs/core/models/savings';
import { SavingsService } from 'src/services/savings.service';
import { SavingsGoalCardComponent } from './savings-goal-card/savings-goal-card.component';
import { SavingsGoalModalComponent } from './savings-goal-modal/savings-goal-modal.component';

@Component({
  selector: 'app-savings-goals',
  templateUrl: './savings-goals.component.html',
  styleUrls: ['./savings-goals.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SavingsGoalCardComponent, SavingsGoalModalComponent],
})
export class SavingsGoalsComponent implements OnInit {
  isModalOpen = false;
  selectedGoal: SavingsGoal | null = null;

  constructor(
    protected savingsService: SavingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    void this.savingsService.refresh();
  }

  openCreate(): void {
    this.selectedGoal = null;
    this.isModalOpen = true;
  }

  openEdit(goal: SavingsGoal): void {
    this.selectedGoal = { ...goal };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  openDetails(goal: SavingsGoal): void {
    void this.router.navigate(['/savings', goal.id]);
  }

  async remove(goal: SavingsGoal): Promise<void> {
    await this.savingsService.confirmDeleteGoal(goal);
  }
}
