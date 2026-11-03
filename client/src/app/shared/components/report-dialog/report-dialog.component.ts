import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../../core/services/report.service';
import type { ReportReason, ReportTargetType } from '../../../models/report.model';

// Values must match the backend ReportReason enum; labels are display-only.
const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'inappropriate', label: 'Inappropriate or offensive' },
  { value: 'inaccurate', label: 'Inaccurate or misleading' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'other', label: 'Other' },
];

@Component({
  selector: 'app-report-dialog',
  imports: [FormsModule],
  template: `
    <div class="report-backdrop" (click)="close.emit()"></div>
    <div class="report-dialog" role="dialog" aria-modal="true">
      @if (done()) {
        <div class="report-done">
          <span class="report-done-icon">✓</span>
          <h3 class="report-title">Report submitted</h3>
          <p class="report-sub">Thanks — our moderators will take a look.</p>
          <button type="button" class="report-submit" (click)="close.emit()">Done</button>
        </div>
      } @else {
        <div class="report-head">
          <h3 class="report-title">Report {{ targetType() }}</h3>
          <button type="button" class="report-x" aria-label="Close" (click)="close.emit()">✕</button>
        </div>
        @if (targetLabel()) {
          <p class="report-target">{{ targetLabel() }}</p>
        }

        <label class="report-field-label">Reason</label>
        <div class="report-reasons">
          @for (r of reasons; track r.value) {
            <button
              type="button"
              class="report-reason"
              [class.active]="reason() === r.value"
              (click)="reason.set(r.value)"
            >{{ r.label }}</button>
          }
        </div>

        <label class="report-field-label" for="report-note">Details (optional)</label>
        <textarea
          id="report-note"
          class="report-note"
          rows="3"
          placeholder="Add anything that helps us understand the problem…"
          [ngModel]="note()"
          (ngModelChange)="note.set($event)"
        ></textarea>

        @if (error()) {
          <p class="report-error">{{ error() }}</p>
        }

        <div class="report-actions">
          <button type="button" class="report-cancel" (click)="close.emit()">Cancel</button>
          <button
            type="button"
            class="report-submit"
            [disabled]="submitting()"
            (click)="submit()"
          >{{ submitting() ? 'Submitting…' : 'Submit report' }}</button>
        </div>
      }
    </div>
  `,
  styleUrl: './report-dialog.component.scss',
})
export class ReportDialogComponent {
  readonly targetType = input.required<ReportTargetType>();
  readonly targetId = input.required<number>();
  readonly targetLabel = input<string>('');

  readonly close = output<void>();

  private readonly reportService = inject(ReportService);

  readonly reasons = REASONS;
  readonly reason = signal<ReportReason>(REASONS[0].value);
  readonly note = signal('');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly done = signal(false);

  submit(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    this.reportService
      .create({
        targetType: this.targetType(),
        targetId: this.targetId(),
        reason: this.reason(),
        note: this.note().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.done.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          const apiError = (err as { error?: { error?: string } })?.error?.error;
          this.error.set(typeof apiError === 'string' ? apiError : 'Could not submit report. Try again.');
        },
      });
  }
}
