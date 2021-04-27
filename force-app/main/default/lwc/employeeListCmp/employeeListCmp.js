import { LightningElement, track, wire } from 'lwc';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';
import searchEmployees from '@salesforce/apex/EmployeeController.searchEmployees';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EmployeeListCmp extends LightningElement {
    employees;
    error;
    @track isSearching = false;

    @track searchInput = {
        name: '',
        phone: ''
    }

    @track idEmployee;

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
        // Hiển thị loading
        this.isSearching = true;
        searchEmployees({nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone})
            .then((result) => {
                // Lấy kết quả search
                this.employees = result;
                this.error = undefined;
                // ẩn loading
                this.isSearching = false;
                // Toast message success
                const event = new ShowToastEvent({
                    title: 'Message',
                    message: 'Search data was successfully.',
                    variant: 'success'
                });
                this.dispatchEvent(event);
                
            })
            .catch((error) => {
                this.employees = undefined;
                this.error = error;

                // Toast message error
                const event = new ShowToastEvent({
                    title: 'Message',
                    message: 'An error has occured.',
                    variant: 'error'
                });
                this.dispatchEvent(event);
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

    handleSelectedDetail(event) {
        this.idEmployee = event.target.dataset.id;     
        event.preventDefault();
        // khởi tạo dispatch id employee để hiển thi detail employee
        const checkedEvent = new CustomEvent('getdetail', { detail: this.idEmployee});
        this.dispatchEvent(checkedEvent);
        
    }
}