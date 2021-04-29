import { LightningElement, api, track } from 'lwc';

import upSertEmployee from '@salesforce/apex/EmployeeController.upSertEmployee';
import insertEmployee from '@salesforce/apex/EmployeeController.insertEmployee';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EmployeeEditCmp extends LightningElement {
    @api employee;
    @track validator = {};
    @track isAdd = false;
    @track isSaving = false;


    // Get value hiển thị lên input
    connectedCallback() {
        if (JSON.stringify(this.employee) == {} || JSON.stringify(this.employee.Id) == undefined ) {
            this.employee = this.setDefaultValueAdd();
            this.isAdd = true;
        }
        this.validator = this.initValidatorData();
    }

    setDefaultValueAdd() {
        return {
            Id: '',
            Name: '',
            Email__c: '',
            Phone__c: '',
            BirthDay__c: '',
            Memo__c: '',
        };
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

        if (employee.BirthDay__c.trim() === '' || employee.BirthDay__c === null) {
            validObject.birthday = REQ_FIELD_VALID;
        }
        this.validator = validObject;
        return !validObject.name.isError && !validObject.email.isError && !validObject.birthday.isError;
    }

    saveEmployee() {
        // set value employee import vao model
        let inputEmployee = {
            Id: this.employee.Id,
            Name: this.employee.Name,
            Email: this.employee.Email__c,
            Phone: this.employee.Phone__c,
            BirthDay: this.employee.BirthDay__c,
            Memo: this.employee.Memo__c,
        };
        // get message error chua nhap input (email, name or birthday)
        let inputEmp = Object.assign({}, this.employee);
        let isValid = this.validateInput(inputEmp);

        // validate input
        if(isValid) {
            insertEmployee({model: inputEmployee})
            .then((result) => {
                let msg = JSON.parse(result);
                console.log(msg);
                const event = new ShowToastEvent({
                    "title": msg.title,
                    "message": msg.message,
                    variant: msg.variant
                });

                // hien thi thay doi cua employee len component Detail khi edit thanh cong
                if(msg.variant == 'success') {
                    console.log(this.employee.Id);
                    this.dispatchEvent(new CustomEvent('savedemployee', { detail: JSON.stringify(msg) }));
                }
                this.dispatchEvent(event);
                this.closeModalHandler();
                
            }).catch((error) => {
                const event = new ShowToastEvent({
                    "title": 'Error!',
                    "message": 'System error. Please reload page.',
                    variant: 'error'
                });
                this.dispatchEvent(event);
            });
        }
    }

    // Hien thi border và text mau do khi khong nhap fields bat buoc
    get classInputNameWrapper() {
        return this.getInputWrapperClassCss(this.validator.name.isError);
    }
    get classInputEmailWrapper() {
        return this.getInputWrapperClassCss(this.validator.email.isError);
    }
    get classInputBirthDayWrapper() {
        return this.getInputWrapperClassCss(this.validator.birthday.isError);
    }

    getInputWrapperClassCss(isError) {
        return isError ? 'slds-form-element slds-size_1-of-2 slds-has-error': 'slds-form-element slds-size_1-of-2';
    }
}