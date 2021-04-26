import { LightningElement, api } from 'lwc';

export default class EmployeeEditCmp extends LightningElement {
    @api employee;

    closeModalHandler() {
        this.dispatchEvent(new CustomEvent('closeeditemployee'));
    }

    changeFieldInputHandler(event) {
        let empObj = {};
        Object.assign(empObj, this.employee);
        empObj[event.currentTarget.dataset.fieldName] = event.target.value;
        this.employee = empObj;
    }

    saveEmployee() {
        console.log('saved employee: ' + this.employee.Name);
        this.dispatchEvent(new CustomEvent('savedemployee', {detail: JSON.stringify(this.employee)}));
    }
}