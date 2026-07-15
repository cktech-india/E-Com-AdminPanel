import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';


/*
@Component({
    selector: '[util-common-error]',
    template: `@if (inputForm.get(fieldCode).dirty) {
        @if (inputForm.get(fieldCode).hasError('required')) {
            <mat-error> {{ fieldLabel }} Is Mandatory</mat-error>
        }
        @if (inputForm.get(fieldCode).hasError('serverError')) {
            <mat-error> {{ inputForm.get(fieldCode).getError('serverError') }}</mat-error>
        }
    }`,
    styles: ``,
    standalone: true,
    imports: [MatError, JsonPipe],
})
*/

@Directive({
    selector: '[util-common-error]',
    standalone: true,
})
export class ErrorCommonDirective implements OnChanges {
    @Input() fieldCode: string;
    @Input() fieldLabel: string;
    @Input() inputForm: FormGroup;
    private destroy$ = new Subject<void>();
    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) {}
    ngOnChanges(): void {
        this.updateErrorMessage();
    }

    ngOnInit(): void {
        const control = this.inputForm.get(this.fieldCode);

        if (control) {
            // Trigger once initially
            this.updateErrorMessage();

            // Subscribe to status changes (runs every time validation triggers)
            control.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
                this.updateErrorMessage();
            });
        }
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    private updateErrorMessage() {
        const control = this.inputForm.get(this.fieldCode);
        if (!control || !control.dirty || control.valid) {
            this.renderer.setProperty(this.el.nativeElement, 'innerText', '');
            return;
        }

        // Use provided label OR generate one from the fieldCode
        const label = this.fieldLabel || this.formatLabel(this.fieldCode);

        if (control.hasError('required')) {
            this.renderer.setProperty(this.el.nativeElement, 'innerText', `${label} is mandatory`);
        } else if (control.hasError('serverError')) {
            this.renderer.setProperty(this.el.nativeElement, 'innerText', control.getError('serverError'));
        }
    }

    /**
     * Converts 'endDate' to 'End Date' or 'customerName' to 'Customer Name'
     */
    private formatLabel(key: string): string {
        if (!key) return '';
        const spaced = key.replace(/([A-Z])/g, ' $1'); // Adds space before capital letters
        return spaced.charAt(0).toUpperCase() + spaced.slice(1).trim(); // Capitalize first letter
    }
}
