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


    @track searchInput = {
        name: '',
        phone: ''
    }
    mang = [];

    @track idEmployee;
    @track employeeNo;

    // Hiển thị list ban đầu
    @wire(getEmployeeList)
    wiredEmployees({ error, data }) {
        if (data) {
            this.fetchDataEmployee(data);
            this.displayEmployees();
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.employees = undefined;
        }
    }

    // Lấy data employee
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

    // Hàm refresh page
    handleRefreshPage() {
        this.isRefreshing = true;
        setTimeout(() => {
            searchEmployees({ nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone })
                .then((result) => {
                    // Lấy kết quả search
                    this.fetchDataEmployee(result);
                    this.error = undefined;
                    // Hiển thị lại list
                    console.log('currentPage: ' + this.currentPage);
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
        }, 300);
    }


    handleChangeSearchInput(event) {
        this.searchInput[event.currentTarget.dataset.searchName] = event.target.value;
    }

    handleSearchEmployees() {
        // Hiển thị loading
        this.isSearching = true;

        setTimeout(() => {
            searchEmployees({ nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone })
                .then((result) => {
                    this.fetchDataEmployee(result);
                    // Lấy kết quả search
                    this.error = undefined;
                    // ẩn loading
                    this.isSearching = false;

                    // Toast message success
                    this.raiseToaseEvent('Search data was successfully.', 'success');

                    // Hiển thị lại list
                    this.currentPage = 1;
                    this.displayEmployees();
                })
                .catch((error) => {
                    this.employees = undefined;
                    this.error = error;

                    // Toast message error
                    this.raiseToaseEvent('An error has occured.', 'error');

                })
        }, 300);
        
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
        this.dispatchEvent(new CustomEvent('openmodalupsertemployee', { detail: { employees: JSON.stringify(employee), checked : check}  }))

    }

    findEmployeeById(employeeId) {
        return this.employees.find(emp => emp.Id == employeeId);
    }

    handleSelectedDetail(event) {
        this.idEmployee = event.target.dataset.id;
        this.employeeNo = event.target.dataset.no;
       
        this.handleDispatchDetailEmployees();
    }

    // Lấy và Gửi employee đã tìm kiếm qua EmployeeId
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
                for(let i = 0; i < this.employees.length; i++) {
                    if (this.employees[i].Id == this.idEmployee) {
                        this.employees[i].isSelected = true;
                    } else {
                        this.employees[i].isSelected = false;
                    }
                }
                // khởi tạo dispatch id employee để hiển thi detail employee
                const checkedEvent = new CustomEvent('getdetail', { detail: this.employeeDetail });
                this.dispatchEvent(checkedEvent);

            })
            .catch((error) => {
                this.employeeDetail = undefined;
                this.error = error;
            });
    }


    // Xử lý hiển thị các bản ghi thay đổi sau khi add hoặc edit
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
            // if (employee.No !== '-') {
            //     let index = this.findIndexEmployeeFromListDisplay(employee.Id);
            //     this.displayingEmployees[index] = employee;
            //     this.employees[employee.No - 1] = employee;
            // } else {
                console.log('emp: ', JSON.stringify(employee));
                let index = this.findIndexEmployeeFromListDisplay(employee.Id);
                console.log('index: ', index);
                this.displayingEmployees[index] = employee;
                let index1 = this.findIndexEmployeeFromListAll(employee.Id);
                console.log('index1: ', index1);
                this.employees[index1] = employee;
                console.log('abc');
            // }
            
        }
    }

    // Get tổng số bản ghi
    get getTotalRecord() {
        return this.employees.length;
    }

    // Xử lý sự kiện paging
    handlePagingEvent(event) {
        this.currentPage = event.detail.currentPage;
        this.itemPerPage = event.detail.itemPerPage;
        this.displayEmployees();
    }

    // Hiển thị list employee theo paging
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
        for(let i = 0; i < this.displayingEmployees.length; i++) {
            if (this.displayingEmployees[i].Id === employeeId) {
                index = i;
            }
        }
        return index;
    }

    findIndexEmployeeFromListAll(employeeId) {
        let index = 0;
        for(let i = 0; i < this.employees.length; i++) {
            if (this.employees[i].Id === employeeId) {
                index = i;
            }
        }
        return index;
    }

    // Hiển thị lại list sau khi delete items
    handleDisplayDeleteEmployee(employeeId) {
      
            let employee = this.findEmployeeById(employeeId);
            if (employee.No === '-') {
                let index = this.findIndexEmployeeFromListDisplay(employeeId);
                console.log('index: ' + index);
                this.displayingEmployees.splice(index, 1);
                let index1 = this.findIndexEmployeeFromListAll(employeeId);
                console.log('index1: ', index1);
                this.employees.splice(index1, 1);
            } else {
                let index = this.findIndexEmployeeFromListDisplay(employeeId);
                console.log('index: ' + index);
                this.displayingEmployees.splice(index, 1);
                let index1 = (this.currentPage - 1) * this.itemPerPage+ index;
                console.log('index1: ', index1);
                this.employees.splice(index1, 1);
                if (this.displayingEmployees.length == 0) {
                    this.currentPage--;
                }
                console.log('length: ', index1);
                this.displayEmployees();
                // let index2 = this.itemPerPage * this.currentPage - 1;
                // let indexLast = this.employees.length - (this.employees.length % this.itemPerPage);
                // console.log('index2: ', index2);
                // console.log('indexLast: ', indexLast);
                // console.log('length: ', this.displayingEmployees.length);
                // if (index2 < indexLast) {
                //     this.displayingEmployees.push(this.employees[index2]);
                // } else {
                //     if (this.displayingEmployees.length == 0) {
                //         this.currentPage--;
                //     }
                //     this.displayEmployees();
                // }
            }
            
        
    }

    // thực hiện delete Employee
    handleDeleteEmployee(event) {
        let data = event.target.dataset;
        let confirmDelete = window.confirm('Do you want to delete employee: [' + data.name + ']');
        this.checkEmployee = this.template.querySelector(`[data-id="${data.id}"]`).checked;
        if(confirmDelete) {
            deleteEmployee({ employeeId: data.id })
            .then((result) => {
                let msg = JSON.parse(result);
                const event = new ShowToastEvent({
                    "title": msg.title,
                    "message": msg.message,
                    variant: msg.variant
                });

                //hien thi thay doi cua employee len component Detail khi delete thanh cong
                if(msg.variant == 'success') {                  
                    if(this.checkEmployee) {
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