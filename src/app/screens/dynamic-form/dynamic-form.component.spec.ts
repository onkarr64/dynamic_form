import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormComponent } from './dynamic-form.component';
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DynamicFormComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build form on initialization', () => {
    component.ngOnInit();
    expect(component.form.contains('Order No')).toBe(true);
    expect(component.form.contains('OrderedDate')).toBe(true);
    expect(component.form.contains('OrderedInfo')).toBe(true);
    expect(component.form.contains('Price')).toBe(true);
    expect(component.form.contains('Refurbished')).toBe(true);
    expect(component.form.contains('Address')).toBe(true);
  });

  it('should apply required validator on fields', () => {
    component.ngOnInit();
    const orderNoControl = component.form.get('Order No');
    orderNoControl?.setValue('');
    expect(orderNoControl?.valid).toBeFalsy();
    orderNoControl?.setValue('12345');
    expect(orderNoControl?.valid).toBeTruthy();
  });

  it('should update field visibility based on rules', () => {
    component.ngOnInit();
    const orderedDateControl = component.form.get('OrderedDate');
    const orderedInfoControl = component.form.get('OrderedInfo');

    orderedDateControl?.setValue('');
    expect(orderedInfoControl?.disabled).toBeTruthy();

    orderedDateControl?.setValue('2024-10-01');
    component.updateFieldVisibility(component.formDefinition.find(f => f.name === 'OrderedInfo'));
    expect(orderedInfoControl?.enabled).toBeTruthy();
  });
});
