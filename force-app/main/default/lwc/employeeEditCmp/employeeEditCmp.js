import { LightningElement, api, track } from 'lwc';

import upSertEmployee from '@salesforce/apex/EmployeeController.upSertEmployee';

export default class EmployeeEditCmp extends LightningElement {
    @api employee;
    @track validator = {};
    @track isAdd = false;
    @track isSaving = false;

    connectedCallback() {
        if (this.employee === undefined) {
            this.isAdd = true;
        }
        this.validator = this.initValidatorData();
    }

    closeModalHandler() {
        this.dispatchEvent(new CustomEvent('closeeditemployee'));
    }

    changeFieldInputHandler(event) {
        let empObj = {};
        Object.assign(empObj, this.employee);
        empObj[event.currentTarget.dataset.fieldName] = event.target.value;
        this.employee = empObj;
    }

    initValidatorData() {
        return {
            name: {isError: false, errMsg: ""},
            email: {isError: false, errMsg: ""},
            birthday: {isError: false, errMsg: ""}
        }
    }

    validateInput(employee) {
        let validObject = this.initValidatorData();

        let REQ_FIELD_VALID = {
            isError: true,
            errMsg: "This field is required"
        }

        if (employee.Name.trim() === '' || employee.Name === undefined) {
            validObject.name = REQ_FIELD_VALID;
        }

        if (employee.Email__c.trim() === '' || employee.Email__c === undefined) {
            validObject.email = REQ_FIELD_VALID;
        }

        if (employee.BirthDay__c === null) {
            validObject.birthday = REQ_FIELD_VALID;
        }
        this.validator = validObject;
        return !validObject.name.isError && !validObject.email.isError && !validObject.birthday.isError;
    }

    saveEmployee() {
        // Validate input Employee
        let inputEmp = Object.assign({}, this.employee);
        let isValidInput = this.validateInput(inputEmp);

        if(isValidInput) {
            upSertEmployee({objEmployee: inputEmp, isAdd: this.isAdd})
            .then((result) => {
                
                this.dispatchEvent(new CustomEvent('savedemployee', {detail: JSON.stringify(this.employee)}));
            }).catch((error) => {

            });
            
        } else {
            console.log('error');
        }

    }
}