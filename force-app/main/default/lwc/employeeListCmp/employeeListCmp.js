import { LightningElement, track, wire, api } from 'lwc';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';
import searchEmployees from '@salesforce/apex/EmployeeController.searchEmployees';
import deleteEmployee from '@salesforce/apex/EmployeeController.deleteEmployee';
import getDetailEmployeeById from '@salesforce/apex/EmployeeController.getDetailEmployeeById';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EmployeeListCmp extends LightningElement {
    @track employees = [];
    displayingEmployees;
    error;
    employeeDetail;
    @track isSearching = false;
    @track itemPerPage = 2;
    @track currentPage = 1;
    @track isShowNotHasRecord = false;
    @track isRefreshing = false;


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
            console.log('emp: ' + JSON.stringify(this.employees));
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
                isChecked: false
            }
            empTemp.push(objectEmp);
        });
        this.employees = empTemp
    }

    // Hàm refresh page
    handleRefreshPage() {
        this.isRefreshing = true;
        console.log('isRefreshing: ' + this.isRefreshing);
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
        console.log('isRefreshing: ' + this.isRefreshing);
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
                    console.log('emp: ' + JSON.stringify(this.employees));
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
        let check = this.template.querySelector(`[data-id="${employeeId}"]`).checked;
        
        let employee = {};
        if (employeeId != undefined) {
            employee = this.findEmployeeById(employeeId);
        }
        this.dispatchEvent(new CustomEvent('openmodalupsertemployee', { detail: { employees: JSON.stringify(employee), checked : check}  }))

    }

    findEmployeeById(employeeId) {
        return this.employees.find(emp => emp.Id == employeeId);
    }

    @api
    changeDetailAction(id) {
        console.log('changeDetailAction', id);
        this.idEmployee = id;
        // this.employeeNo = event.target.dataset.no;
        this.handleDispatchDetailEmployees(event);
    }

    handleSelectedDetail(event) {
        this.idEmployee = event.target.dataset.id;
        this.employeeNo = event.target.dataset.no;
        this.handleDispatchDetailEmployees(event);
    }

    // Lấy và Gửi employee đã tìm kiếm qua EmployeeId
    @api
    handleDispatchDetailEmployees(event) {
        getDetailEmployeeById({ employeeId: this.idEmployee })
            .then((result) => {
                let objEmp = {
                    ...result,
                    No: this.employeeNo
                }
                this.employeeDetail = objEmp;
                this.error = undefined;
                console.log('Detail', JSON.stringify(this.employeeDetail));
                event.preventDefault();
                // khởi tạo dispatch id employee để hiển thi detail employee
                const checkedEvent = new CustomEvent('getdetail', { detail: this.employeeDetail });
                this.dispatchEvent(checkedEvent);

            })
            .catch((error) => {
                this.employeeDetail = undefined;
                this.error = error;
            });
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
        console.log('length: ' + this.employees.length);
        if (this.employees.length == 0) {
            return true;
        }
        return false;
    }

    // delete Employee
    handleDeleteEmployee(event) {
        let data = event.target.dataset;
        let confirmDelete = window.confirm('Do you want to delete employee: [' + data.name + ']');
        if(confirmDelete) {
            deleteEmployee({ employeeId: data.id })
            .then((result) => {
                let msg = JSON.parse(result);
                console.log(msg);
                const event = new ShowToastEvent({
                    "title": msg.title,
                    "message": msg.message,
                    variant: msg.variant
                });

                // hien thi thay doi cua employee len component Detail khi edit thanh cong
                // if(msg.variant == 'success') {
                //     console.log(this.employee.Id);
                //     this.dispatchEvent(new CustomEvent('savedemployee', { detail: JSON.stringify(msg) }));
                // }
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