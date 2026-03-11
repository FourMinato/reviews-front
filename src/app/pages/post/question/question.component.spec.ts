import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAllPostsComponent } from './question.component';

describe('QuestionAllPostsComponent', () => {
  let component: QuestionAllPostsComponent;
  let fixture: ComponentFixture<QuestionAllPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionAllPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionAllPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
