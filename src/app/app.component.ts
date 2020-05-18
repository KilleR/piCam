import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'picSlice';

  totalSlices = 24 * 4;
  sliceCount: number;

  start = 4 * 4;
  end = 22 * 4;

  hours$ = new Subject<string[]>();
  preLoadDone$ = new Subject();

  controls: FormGroup;
  preloadSrc: string;
  preloadCount: number;
  preloadCurrent$ = new Subject<number>();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.controls = this.fb.group({
      start: [this.start],
      end: [this.end]
    });

    this.doImagePrecache();

    this.onChanges();
  }

  onChanges() {
    this.controls.valueChanges.subscribe(res => {
      this.start = res.start;
      this.end = res.end;
      this.buildSlices();
    });
  }

  doImagePrecache() {
    const preloadHours = Array(this.totalSlices).fill(0).map((x, i) => {
      return Math.floor(i / 4) + '_' + i % 4 * 15;
    });
    this.preloadCount = this.preloadCount = preloadHours.length;
    this.preloadCurrent$.next(0);
    this.preloadSrc = 'assets/cam_' + preloadHours.pop() + '.jpg';

    this.preLoadDone$.subscribe({
      next: () => {
        if (preloadHours.length) {
          this.preloadSrc = 'assets/cam_' + preloadHours.pop() + '.jpg';
          this.preloadCurrent$.next(this.preloadCount - preloadHours.length);
        } else {
          this.preLoadDone$.complete();
        }
      }, complete: () => {
        console.log('loading complete...');
        this.buildSlices();
      }
    });
  }

  buildSlices() {
    this.sliceCount = this.end - this.start;
    console.log(this.sliceCount);
    this.hours$.next(Array(this.sliceCount).fill(0).map((x, i) => {
      i = (i + this.start) % this.totalSlices;
      return Math.floor(i / 4) + '_' + i % 4 * 15;
    }));
  }

  trackByHour(index: number, hour: string) {
    return hour;
  }

  onBgLoad() {
    console.log('done loading');
    this.preLoadDone$.next();
  }
}
