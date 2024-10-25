import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {JsonPipe, NgClass, NgForOf, NgIf} from "@angular/common";

interface RuleModel {
  field: string;
  operator: string;
  value: any;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    JsonPipe,
    NgClass
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent implements OnInit {
  // Form group for managing form controls
  form: FormGroup = this.fb.group({});

  // Form definition array containing metadata for each field
  formDefinition = [
    // Example form fields with their properties such as field type, group, validators, etc.
    {
      "fieldtype": "text",
      "name": "Order No",
      "group": "General Information",
      "validator": ["required"]
    },
    {
      "fieldtype": "date",
      "name": "OrderedDate",
      "group": "General Information",
      "validator": ["required"]
    },
    {
      "fieldtype": "text",
      "name": "OrderedInfo",
      "group": "General Information",
      "validator": ["required"],
      "condition": "and",
      "rules": [
        {
          "field": "OrderedDate",
          "operator": "!=",
          "value": ""
        }
      ]
    },
    {
      "fieldtype": "integer",
      "name": "Price",
      "group": "Product Information",
      "validator": ["required"]
    },
    {
      "fieldtype": "boolean",
      "name": "Refurbished",
      "group": "Product Information",
      "selectList": ["Yes", "No"]
    },
    {
      "fieldtype": "text",
      "name": "Address",
      "group": "Product Information",
      "condition": "or",
      "rules": [
        {
          "field": "Order No",
          "operator": ">=",
          "value": "100"
        },
        {
          "field": "Price",
          "operator": "<=",
          "value": "100"
        }
      ]
    }
  ];

  constructor(private fb: FormBuilder) {}

  // Lifecycle hook to initialize the component
  ngOnInit() {
    this.buildForm();  // Build the form with controls from formDefinition
    this.setupFieldVisibility();  // Set up field visibility based on conditions
    this.evaluateAllFieldVisibility();  // Evaluate visibility for all fields initially
  }

  // Function to build the form dynamically based on formDefinition
  buildForm() {
    const formControls = {};
    this.formDefinition.forEach(field => {
      const validators = this.getValidators(field.validator); // Get validators for each field
      // @ts-ignore
      formControls[field.name] = ['', validators];  // Add form control with validators
    });
    this.form = this.fb.group(formControls);  // Create the form group with all controls
  }

  // Function to map validator strings to Angular validator functions
  getValidators(validators: any) {
    const formValidators = [];
    if (validators && validators.includes('required')) {
      formValidators.push(Validators.required);  // Add 'required' validator if defined
    }
    return formValidators;  // Return the list of validators
  }

  // Function to set up dynamic visibility for fields based on conditions
  setupFieldVisibility() {
    this.formDefinition.forEach(field => {
      if (field.rules) {  // If there are visibility rules for the field
        field.rules.forEach(rule => {
          this.form?.get(rule.field)?.valueChanges.subscribe(() => {
            // Whenever the dependent field's value changes, update visibility
            this.updateFieldVisibility(field);
          });
        });
      }
    });
  }

  // Function to update visibility of a field based on its conditions
  updateFieldVisibility(field: any) {
    let shouldShow = false;

    // If the condition is 'or', check if any rule evaluates to true
    if (field.condition === 'or') {
      shouldShow = field.rules.some((rule: RuleModel) => this.evaluateCondition(rule));
    }
    // If the condition is 'and', check if all rules evaluate to true
    else if (field.condition === 'and') {
      shouldShow = field.rules.every((rule: RuleModel) => this.evaluateCondition(rule));
    }

    // Enable or disable the form control based on the evaluation
    if (shouldShow) {
      this.form?.get(field.name)?.enable();  // Enable the field if conditions are met
    } else {
      this.form?.get(field.name)?.disable();  // Disable the field if conditions are not met
      this.form?.get(field.name)?.reset();  // Optionally reset the value when hiding
    }
  }

  // Function to evaluate if a rule is satisfied based on the form control's value
  evaluateCondition(rule: RuleModel): boolean {
    const fieldValue = this.form?.get(rule.field)?.value;

    // Return false if the field value is null, undefined, or empty
    if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
      return false;
    }

    // Evaluate the condition based on the rule's operator
    switch (rule.operator) {
      case '>=':
        return fieldValue >= rule.value;
      case '<=':
        return fieldValue <= rule.value;
      case '==':
        return fieldValue == rule.value;
      case '!=':
        return fieldValue != rule.value;
      default:
        return false;  // Return false for unsupported operators
    }
  }

  // Function to evaluate visibility for all fields initially
  evaluateAllFieldVisibility() {
    this.formDefinition.forEach(field => {
      if (field.rules) {
        this.updateFieldVisibility(field);  // Update visibility based on conditions
      }
    });
  }

  // Function to check if a field is invalid, used for validation error messages
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);  // Get the form control
    // Return true if the field is invalid and has been either touched or modified
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  // Function to handle form submission
  submitForm() {
    if (this.form?.valid) {
      console.log('Form Submitted', this.form.value);  // Log form data if the form is valid
    } else {
      // If the form is invalid, mark all controls as touched to trigger validation
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.markAsTouched();  // Mark the field as touched to show validation errors
        }
      });
    }
  }

  // Function to return a list of unique group names from the form definition
  getUniqueGroups(): string[] {
    return [...new Set(this.formDefinition.map(field => field.group))];  // Extract unique group names
  }

  // Function to get all fields that belong to a specific group
  getFieldsByGroup(group: string): any[] {
    return this.formDefinition.filter(field => field.group === group);  // Return fields for the given group
  }
}

