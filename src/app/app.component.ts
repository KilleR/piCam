import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BehaviorSubject, Subject} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'picSlice';


  sliceCount: number;

  sliceDensity = 4;
  totalSlices = 24 * this.sliceDensity;
  start = 0 * this.sliceDensity;
  length = 24 * this.sliceDensity;

  hours$ = new Subject<string[]>();
  preLoadDone$ = new Subject();

  controls: FormGroup;
  preloadSrc: string;
  preloadCount: number;
  preloadImages$ = new BehaviorSubject<string[]>([]);

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {

    this.controls = this.fb.group({
      start: [this.start],
      length: [this.length]
    });

    this.doImagePrecache();

    this.onChanges();
  }

  onChanges() {
    this.controls.valueChanges.subscribe(res => {
      let cycleStart = res.start % this.sliceCount;
      if (cycleStart < 0) {
        cycleStart += this.sliceCount;
      }
      this.start = this.sliceCount - cycleStart;
      this.length = res.length;
      this.buildSlices();
    });
  }

  onSliderChange(evt) {
    console.log('slider change', evt);
  }


  doImagePrecache() {
    const preloadHours = Array(this.totalSlices).fill(0).map((x, i) => {
      return Math.floor(i / this.sliceDensity) + '_' + i % this.sliceDensity * 15;
    });
    this.preloadCount = this.preloadCount = preloadHours.length;
    this.addImagePreload('assets/cam_' + preloadHours.pop() + '.jpg');

    this.preLoadDone$.pipe(delay(1)).subscribe({
      next: () => {
        if (preloadHours.length) {
          this.addImagePreload('assets/cam_' + preloadHours.pop() + '.jpg');
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
    this.sliceCount = this.length;
    this.hours$.next(Array(this.sliceCount).fill(0).map((x, i) => {
      i = (i + this.start) % this.totalSlices;
      return Math.floor(i / this.sliceDensity) + '_' + i % this.sliceDensity * 15;
    }));
  }

  tickToHour(tick: number) {
    return Math.floor(tick / 4) + ':' + tick % 4 * 15;
  }

  trackByStringArray(index: number, hour: string) {
    return hour;
  }

  onBgLoad() {
    console.log('done loading');
    this.preLoadDone$.next();
  }

  private addImagePreload(src: string) {
    this.preloadImages$.next([...this.preloadImages$.value, src]);
  }
}
