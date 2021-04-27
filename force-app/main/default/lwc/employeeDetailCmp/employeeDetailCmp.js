import { LightningElement, api, track } from 'lwc';

export default class EmployeeDetailCmp extends LightningElement {
    @api employee;
    @api employeedetail;

    get isHasRecord() {
        return true;
    }

    handleClick () {
        //console.log(this.idemployee);
        console.log('detail');
        console.log(this.employee);
    }
}