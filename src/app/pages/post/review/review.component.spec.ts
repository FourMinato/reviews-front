import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAllPostsComponent } from './review.component';

describe('ReviewAllPostsComponent', () => {
  let component: ReviewAllPostsComponent;
  let fixture: ComponentFixture<ReviewAllPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewAllPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewAllPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
