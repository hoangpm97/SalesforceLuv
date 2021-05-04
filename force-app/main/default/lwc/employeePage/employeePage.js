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
        console.log('employee1', this.dataEdit.employee);
        console.log('check', this.dataEdit.checked);
        this.dataEdit.isShow = true;
    }

    closeModalEditEmployee(event) {
        this.dataEdit.isShow = false;
    }
    
    savedEmployee(event) {
        console.log('save Employee', event.detail);
        this.template.querySelector('c-employee-list-cmp').handleDispatchDetailEmployees();
       
    }

    handleShowDetailEmployee = (event) => {
        this.dataDetail.employee = event.detail;
        this.dataDetail.isHasRecord = true;
    }


}