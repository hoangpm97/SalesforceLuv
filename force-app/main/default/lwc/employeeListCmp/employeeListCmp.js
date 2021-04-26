import { LightningElement, track, wire } from 'lwc';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';
import searchEmployees from '@salesforce/apex/EmployeeController.searchEmployees';
export default class EmployeeListCmp extends LightningElement {
    employees;
    error;

    @track searchInput = {
        name: '',
        phone: ''
    }

    @wire(getEmployeeList)
    wiredEmployees({error, data}) {
        if (data) {
            this.employees = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.employees = undefined;
        }
    }

    handleChangeSearchInput(event) {
        this.searchInput[event.currentTarget.dataset.searchName] = event.target.value;
    }

    handleSearchEmployees() {
        searchEmployees({nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone})
            .then((result) => {
                this.employees = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.employees = undefined;
                this.error = error;
            });
    }

    handleOpenModalUpsertEmployee(event) {
        let employeeId = event.target.dataset.id;
        let employee = {};

        employee = this.findEmployeeById(employeeId);
        this.dispatchEvent(new CustomEvent('openmodalupsertemployee', {detail: JSON.stringify(employee)}) )

    }

    findEmployeeById(employeeId) {
        return this.employees.find(emp => emp.Id == employeeId);
    }
}