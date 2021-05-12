import { LightningElement, api, track } from 'lwc';
import insertEmployee from '@salesforce/apex/EmployeeController.doUpsertEmployee';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EmployeeEditCmp extends LightningElement {
    @api employee;
    @api checked;
    @track validator = {};
    @track isAdd = false;
    @track isSaving = false;


    // Get value display up input
    connectedCallback() {
        if (JSON.stringify(this.employee) == {} || JSON.stringify(this.employee.Id) == undefined ) {
            this.employee = this.setDefaultValueAdd();
            this.isAdd = true;
        }
        this.validator = this.initValidatorData();
    }

    // Set value default input event Add
    setDefaultValueAdd() {
        return {
            Id: '',
            Name: '',
            Email__c: '',
            Phone__c: '',
            BirthDay__c: '',
            Memo__c: '',
            SrcAvatar__c: ''
        };
    }

    // close popup Add/Edit
    closeModalHandler() {
        this.dispatchEvent(new CustomEvent('closeeditemployee'));
    }

    changeFieldInputHandler(event) {
        let empObj = {};
        Object.assign(empObj, this.employee);
        if (event.currentTarget.dataset.fieldName !== undefined) {
            empObj[event.currentTarget.dataset.fieldName] = event.target.value;
        }
        
        // handle input avatar
        this.previewFile(empObj);
        setTimeout(() => {
            this.employee = empObj;
            console.log('emp: ', JSON.stringify(this.employee));
        }, 500);
    }

    previewFile(empObject) {
        const preview = this.template.querySelector('img');
        const file = this.template.querySelector('input[type=file]').files[0];
        var size = parseFloat(file.size / (1024 * 1024)).toFixed(2);
        const reader = new FileReader();
        if (size > 1) {
            let SIZE_OF_FILE_VALID = {
                isError: true,
                errMsg: "Please select image size less than 1 MB"
            }
            this.validator.avatar = SIZE_OF_FILE_VALID;
        } else {
            this.validator.avatar.isError = false;
            reader.addEventListener("load", function () {
                // convert image file to base64 string
                preview.src = reader.result;
                empObject.SrcAvatar__c = reader.result;
              }, false);
        }
        
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    initValidatorData() {
        return {
            name: {isError: false, errMsg: ""},
            email: {isError: false, errMsg: ""},
            birthday: {isError: false, errMsg: ""},
            avatar: {isError: false, errMsg: ""}
        }
    }

    // validate value input when insert/update
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

    // insert/update employee to database
    saveEmployee() {
        // format lastModifiedDate
        if (this.employee.Id != '') {
            var lastModifiedDate = this.employee.LastModifiedDate;
            var pos = lastModifiedDate.lastIndexOf('.');
            if(pos != -1) {
                lastModifiedDate = lastModifiedDate.substring(0,pos);
            }
        } 
        // set value employee import to model
        let inputEmployee = {
            Id: this.employee.Id,
            Name: this.employee.Name,
            Email: this.employee.Email__c,
            Phone: this.employee.Phone__c,
            BirthDay: this.employee.BirthDay__c,
            Memo: this.employee.Memo__c,
            LastModifiedDate: lastModifiedDate,
            SrcAvatar: this.employee.SrcAvatar__c
        };

        let inputEmp = Object.assign({}, this.employee);
        let isValid = this.validateInput(inputEmp);
        // validate input
        if(isValid) {
            insertEmployee({model: inputEmployee})
            .then((result) => {
                let msg = JSON.parse(result);
                inputEmp.Id = msg.empid;
                const event = new ShowToastEvent({
                    "title": msg.title,
                    "message": msg.message,
                    variant: msg.variant
                });
                inputEmp.LastModifiedDate = msg.lastModifiedDate.LastModifiedDate;
                
                // Show changes of employee to Detail when edit pass
                this.dispatchEvent(event);
                if(msg.variant == 'success') {
                    if(this.checked) {
                        this.dispatchEvent(new CustomEvent('savedemployee'));
                    }
                    this.dispatchEvent(new CustomEvent('saveemptolist', {detail: inputEmp}));
                }
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

    // Displays border and text quickly when it does not input fields that are required
    get classInputNameWrapper() {
        return this.getInputWrapperClassCss(this.validator.name.isError);
    }
    get classInputEmailWrapper() {
        return this.getInputWrapperClassCss(this.validator.email.isError);
    }
    get classInputBirthDayWrapper() {
        return this.getInputWrapperClassCss(this.validator.birthday.isError);
    }
    get classInputAvatarWrapper() {
        return this.getInputWrapperClassCss(this.validator.avatar.isError);
    }

    getInputWrapperClassCss(isError) {
        return isError ? 'slds-form-element slds-size_1-of-2 slds-has-error': 'slds-form-element slds-size_1-of-2';
    }
}