import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {
  private _fontSize$ = new BehaviorSubject<string>('md'); // 'sm' | 'md' | 'lg' | 'xl'
  fontSize$ = this._fontSize$.asObservable();

  constructor(@Inject(DOCUMENT) private _document: any) {
    const savedSize = localStorage.getItem('entity-font-size');
    if (savedSize && ['sm', 'md', 'lg', 'xl'].includes(savedSize)) {
      this.setFontSize(savedSize);
    } else {
      this.setFontSize('md');
    }
  }

  setFontSize(size: string): void {
    if (!['sm', 'md', 'lg', 'xl'].includes(size)) return;
    
    this._fontSize$.next(size);
    localStorage.setItem('entity-font-size', size);

    // Remove existing font size classes on document body
    const body = this._document.body;
    body.classList.remove('entity-font-size-sm', 'entity-font-size-md', 'entity-font-size-lg', 'entity-font-size-xl');
    body.classList.add(`entity-font-size-${size}`);
  }

  increase(): void {
    const current = this._fontSize$.value;
    if (current === 'sm') this.setFontSize('md');
    else if (current === 'md') this.setFontSize('lg');
    else if (current === 'lg') this.setFontSize('xl');
  }

  decrease(): void {
    const current = this._fontSize$.value;
    if (current === 'xl') this.setFontSize('lg');
    else if (current === 'lg') this.setFontSize('md');
    else if (current === 'md') this.setFontSize('sm');
  }

  getCurrentSize(): string {
    return this._fontSize$.value;
  }
}
