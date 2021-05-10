import { LightningElement, track , api} from 'lwc';

export default class EmployeePage extends LightningElement {
    @track dataEdit = {
        isShow: false,
        employee: {},
        checked : false
    }


    @track dataDetail = {
        isHasRecord: false,
        employee: {},
        
    };
    
    @track employeedetail;

    openModalEditEmployee(event) {
        this.dataEdit.employee = JSON.parse(event.detail.employees);
        this.dataEdit.checked = event.detail.checked;
        this.dataEdit.isShow = true;
    }

    closeModalEditEmployee(event) {
        this.dataEdit.isShow = false;
    }
    
    savedEmployee() {
        this.template.querySelector('c-employee-list-cmp').handleDispatchDetailEmployees();
    }

    handleShowDetailEmployee = (event) => {
        this.dataDetail.employee = event.detail;
    }

    savedEmpTolist(event) {
        this.template.querySelector('c-employee-list-cmp').handleUpsertEmployee(event.detail);
    }


}