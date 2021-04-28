import { LightningElement, track , api} from 'lwc';

export default class EmployeePage extends LightningElement {
    @track dataEdit = {
        isShow: false,
        employee: {}
    }


    @track dataDetail = {
        isHasRecord: false,
        employee: {},
        
    };
    
    @track employeedetail;

    openModalEditEmployee(event) {
        this.dataEdit.employee = JSON.parse(event.detail);
        this.dataEdit.isShow = true;
        console.log('2');
    }

    closeModalEditEmployee(event) {
        this.dataEdit.isShow = false;
    }
    
    savedEmployee(event) {
        this.dataEdit.employee = JSON.parse(event.detail);
        console.log('employee page: ' + this.dataEdit.employee.Name);
    }

    handleShowDetailEmployee = (event) => {
        this.dataDetail.employee = event.detail;
        this.dataDetail.isHasRecord = true;
    }


}