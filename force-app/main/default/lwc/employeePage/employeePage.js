import { LightningElement, track } from 'lwc';

export default class EmployeePage extends LightningElement {
    @track dataEdit = {
        isShow: false,
        employee: {}
    }

    openModalEditEmployee(event) {
        this.dataEdit.employee = JSON.parse(event.detail);
        this.dataEdit.isShow = true;
    }

    closeModalEditEmployee(event) {
        this.dataEdit.isShow = false;
    }
    
    savedEmployee(event) {
        this.dataEdit.employee = JSON.parse(event.detail);
        console.log('employee page 1: ' + this.dataEdit.employee.Name);
    }
}