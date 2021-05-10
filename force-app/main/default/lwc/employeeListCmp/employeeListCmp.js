import { LightningElement, track, wire, api } from 'lwc';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';
import searchEmployees from '@salesforce/apex/EmployeeController.searchEmployees';
import deleteEmployee from '@salesforce/apex/EmployeeController.deleteEmployee';
import getDetailEmployeeById from '@salesforce/apex/EmployeeController.getDetailEmployeeById';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EmployeeListCmp extends LightningElement {
    @track employees = [];
    @track displayingEmployees = [];
    error;
    employeeDetail;
    @track isSearching = false;
    @track itemPerPage = 2;
    @track currentPage = 1;
    @track isShowNotHasRecord = false;
    @track isRefreshing = false;
    @track checkEmployee = false;
    @track isSearchingOverLimit = false;

    @track searchInput = {
        name: '',
        phone: ''
    }

    @track idEmployee;
    @track employeeNo;

    // Display list 
    @wire(getEmployeeList)
    wiredEmployees({error, data }) {
        if (data) {
            let empData = JSON.parse(data);
            this.fetchDataEmployee(empData.employees);
            this.isSearchingOverLimit = empData.isSearchingOverLimit;
            this.displayEmployees();
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.employees = undefined;
        }
    }

    // Get data employee
    fetchDataEmployee(dataEmp) {
        let empTemp = [];
        dataEmp.forEach((employee, index) => {
            var objectEmp = {
                ...employee,
                No: index + 1,
                isSelected: false
            }
            empTemp.push(objectEmp);
        });
        this.employees = empTemp
    }

    // Method refresh page
    handleRefreshPage() {
        this.isRefreshing = true;
        setTimeout(() => {
            searchEmployees({ nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone })
                .then((result) => {
                    let empData = JSON.parse(result);
                    // Get result search
                    this.fetchDataEmployee(empData.employees);
                    this.isSearchingOverLimit = empData.isSearchingOverLimit;                   
                    this.employees.forEach(emp => {
                        if (emp.Id === this.idEmployee) {
                            emp.isSelected = true;
                        }
                    });
                    this.error = undefined;
                    // Show list again
                    this.displayEmployees();
                    this.raiseToaseEvent('Refresh page was successfully.', 'success');
                    this.isRefreshing = false;
                })
                .catch((error) => {
                    this.employees = undefined;
                    this.error = error;
                    // Toast message error
                    this.raiseToaseEvent('System error. Please reload page.', 'error');
                })
        }, 200);
    }


    handleChangeSearchInput(event) {
        this.searchInput[event.currentTarget.dataset.searchName] = event.target.value;
    }

    handleSearchEmployees() {
        // Show loading
        this.isSearching = true;
        setTimeout(() => {
            searchEmployees({ nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone })
                .then((result) => {
                    let empData = JSON.parse(result);
                    this.fetchDataEmployee(empData.employees);
                    this.isSearchingOverLimit = empData.isSearchingOverLimit;
                    // Get result search
                    this.error = undefined;
                    // hide loading
                    this.isSearching = false;

                    // Toast message success
                    this.raiseToaseEvent('Search data was successfully.', 'success');

                    // Show list again
                    this.currentPage = 1;
                    this.displayEmployees();
                })
                .catch((error) => {
                    this.employees = undefined;
                    this.error = error;

                    // Toast message error
                    this.raiseToaseEvent('An error has occured.', 'error');

                })
        }, 200);

    }

    raiseToaseEvent(strMessage, strVariant) {
        // Toast message error
        const event = new ShowToastEvent({
            title: 'Message',
            message: strMessage,
            variant: strVariant
        });
        this.dispatchEvent(event);
    }

    handleOpenModalUpsertEmployee(event) {
        let employeeId = event.target.dataset.id;
        let check = false;

        let employee = {};
        if (employeeId != undefined) {
            check = this.template.querySelector(`[data-id="${employeeId}"]`).checked;
            employee = this.findEmployeeById(employeeId);
        }
        this.dispatchEvent(new CustomEvent('openmodalupsertemployee', { detail: { employees: JSON.stringify(employee), checked: check } }))

    }

    findEmployeeById(employeeId) {
        return this.employees.find(emp => emp.Id == employeeId);
    }

    handleSelectedDetail(event) {
        this.idEmployee = event.target.dataset.id;
        this.employeeNo = event.target.dataset.no;

        this.handleDispatchDetailEmployees();
    }

    // Get and set employee searched through EmployeeId
    @api
    handleDispatchDetailEmployees() {
        getDetailEmployeeById({ employeeId: this.idEmployee })
            .then((result) => {
                let objEmp = {
                    ...result,
                    No: this.employeeNo
                }
                this.employeeDetail = objEmp;
                this.error = undefined;
                for (let i = 0; i < this.employees.length; i++) {
                    if (this.employees[i].Id == this.idEmployee) {
                        this.employees[i].isSelected = true;
                    } else {
                        this.employees[i].isSelected = false;
                    }
                }
                // Initialize and dispatch `id employee` to display the `detail employee`
                const checkedEvent = new CustomEvent('getdetail', { detail: this.employeeDetail });
                this.dispatchEvent(checkedEvent);

            })
            .catch((error) => {
                this.employeeDetail = undefined;
                this.error = error;
            });
    }


    // Handling the display of changed records after adding or editing
    @api
    handleUpsertEmployee(employee) {
        let empTemp = this.findEmployeeById(employee.Id);
        if (empTemp === undefined) {
            let addedEmp = {
                ...employee,
                No: '-',
                isSelected: false
            }
            this.displayingEmployees.push(addedEmp);
            this.employees.push(addedEmp);

        } else {
            let index = this.findIndexEmployeeFromListDisplay(employee.Id);
            this.displayingEmployees[index] = employee;
            let index1 = this.findIndexEmployeeFromListAll(employee.Id);
            this.employees[index1] = employee;
        }
    }

    // Get the total number of records
    get getTotalRecord() {
        return this.employees.length;
    }

    // Handling event paging
    handlePagingEvent(event) {
        this.currentPage = event.detail.currentPage;
        this.itemPerPage = event.detail.itemPerPage;
        this.displayEmployees();
    }

    // Display the employee list according to paging
    displayEmployees() {
        let displayItems = [];
        let from = (this.currentPage - 1) * this.itemPerPage;
        let to = this.currentPage * this.itemPerPage;
        let totalRecord = this.employees.length;
        if (to > totalRecord) {
            to = totalRecord;
        }
        for (let i = from; i < to; i++) {
            displayItems.push(this.employees[i]);
        }
        this.displayingEmployees = displayItems;
    }

    get getVisibilityIconSearching() {
        return (this.isSearching) ? 'icon-searching' : 'icon-searching hidden-loading';
    }

    get getIsShowNotHasRecord() {

        if (this.employees.length == 0) {
            return true;
        }
        return false;
    }

    findIndexEmployeeFromListDisplay(employeeId) {
        let index = 0;
        for (let i = 0; i < this.displayingEmployees.length; i++) {
            if (this.displayingEmployees[i].Id === employeeId) {
                index = i;
            }
        }
        return index;
    }

    findIndexEmployeeFromListAll(employeeId) {
        let index = 0;
        for (let i = 0; i < this.employees.length; i++) {
            if (this.employees[i].Id === employeeId) {
                index = i;
            }
        }
        return index;
    }

    // Display the list again after delete items
    handleDisplayDeleteEmployee(employeeId) {
        let employee = this.findEmployeeById(employeeId);
        if (employee.No === '-') {
            let index = this.findIndexEmployeeFromListDisplay(employeeId);
            this.displayingEmployees.splice(index, 1);
            let index1 = this.findIndexEmployeeFromListAll(employeeId);
            this.employees.splice(index1, 1);
        } else {
            let index = this.findIndexEmployeeFromListDisplay(employeeId);
            this.displayingEmployees.splice(index, 1);
            let index1 = this.findIndexEmployeeFromListAll(employeeId);
            this.employees.splice(index1, 1);
            if (this.displayingEmployees.length == 0) {
                this.currentPage--;
            }  
            this.displayEmployees();
            
        }
    }

    // Perform delete Employee
    handleDeleteEmployee(event) {
        let data = event.target.dataset;
        let confirmDelete = window.confirm('Do you want to delete employee: [' + data.name + ']');
        this.checkEmployee = this.template.querySelector(`[data-id="${data.id}"]`).checked;
        if (confirmDelete) {
            deleteEmployee({ employeeId: data.id })
                .then((result) => {
                    let msg = JSON.parse(result);
                    const event = new ShowToastEvent({
                        "title": msg.title,
                        "message": msg.message,
                        variant: msg.variant
                    });

                    // Show changes of employee to Detail component when delete pass
                    if (msg.variant == 'success') {
                        if (this.checkEmployee) {
                            this.dispatchEvent(new CustomEvent('getdetail', { detail: undefined }));
                        }
                        this.handleDisplayDeleteEmployee(data.id);
                    }
                    this.dispatchEvent(event);

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

}