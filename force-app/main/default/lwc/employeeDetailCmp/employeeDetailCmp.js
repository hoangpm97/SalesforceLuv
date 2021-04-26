import { LightningElement, api, track } from 'lwc';

export default class EmployeeDetailCmp extends LightningElement {
    @api employee;
    @api idemployee;
    get isHasRecord() {
        if(this.employee != undefined && this.employee.Id != undefined) {
            return true;
        }
        else return false;
    }

    handleClick () {
        console.log(this.idemployee);
    }

    @api
    get getDetailEmployee()  {
        console.log(this.idemployee);
    }
}