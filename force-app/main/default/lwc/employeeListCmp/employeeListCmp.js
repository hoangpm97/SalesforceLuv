import { LightningElement, track, wire } from 'lwc';
import getEmployeeList from '@salesforce/apex/EmployeeController.getEmployeeList';
import searchEmployees from '@salesforce/apex/EmployeeController.searchEmployees';
import getDetailEmployeeById from '@salesforce/apex/EmployeeController.getDetailEmployeeById';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class EmployeeListCmp extends LightningElement {
    employees = [];
    displayingEmployees;
    error;
    employeeDetail;
    @track isSearching = false;
    @track itemPerPage = 2;
    @track currentPage = 1;
    @track isShowNotHasRecord = false;

    @track searchInput = {
        name: '',
        phone: ''
    }

    @track idEmployee;

    @wire(getEmployeeList)
    wiredEmployees({error, data}) {
        if (data) {
            this.employees = data;
            // Hiển thị list ban đầu
            this.displayEmployees();
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
  
        setTimeout(() => {
            searchEmployees({ nameSearch: this.searchInput.name, phoneSearch: this.searchInput.phone })
                .then((result) => {
                    // Lấy kết quả search
                    this.employees = result;
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
                    const event = new ShowToastEvent({
                        title: 'Message',
                        message: 'An error has occured.',
                        variant: 'error'
                    });
                    this.dispatchEvent(event);
                });
               
            });
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
        let employee = {};
        if (employeeId != undefined) {
            employee = this.findEmployeeById(employeeId);
        }
        this.dispatchEvent(new CustomEvent('openmodalupsertemployee', {detail: JSON.stringify(employee)}) )

    }

    findEmployeeById(employeeId) {
        return this.employees.find(emp => emp.Id == employeeId);
    }

    

    handleSelectedDetail(event) {
        this.idEmployee = event.target.dataset.id;
        
        console.log(this.idEmployee)
        this.handleDispatchDetailEmployees(event);
       
        
    }

    // Lấy và Gửi employee đã tìm kiếm qua EmployeeId
    handleDispatchDetailEmployees(event) {
        getDetailEmployeeById({employeeId: this.idEmployee})
            .then((result) => {
                
                this.employeeDetail = result;
                this.error = undefined;
                console.log(this.employeeDetail);
                event.preventDefault();
                // khởi tạo dispatch id employee để hiển thi detail employee
                const checkedEvent = new CustomEvent('getdetail', { detail: this.employeeDetail});
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
        if (this.employees.length == 0) {
            return true;
        }
        return false;
    }

}