import { LightningElement, api, track } from 'lwc';

export default class EmployeeEditCmp extends LightningElement {
    @api employee;
    @track validator = {};

    connectedCallback() {
        console.log('abc');
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

    }

    saveEmployee() {
        console.log('employee: ' + this.employee.BirthDay__c);
        let inputEmp = Object.assign({}, this.employee);
        this.validateInput(inputEmp);
        
        this.dispatchEvent(new CustomEvent('savedemployee', {detail: JSON.stringify(this.employee)}));
    }
}