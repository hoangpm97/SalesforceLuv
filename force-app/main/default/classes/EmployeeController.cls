public with sharing class EmployeeController {

    @AuraEnabled(cacheable=true)
    public static List<Employee__c> searchEmployees(String nameSearch, String phoneSearch){
        String strSQL = 'SELECT Id, Name, Phone__c, BirthDay__c, Email__c ';
        strSQL += ' FROM Employee__c ';
        strSQL += ' WHERE Id != null ';
        
        
        if(String.isNotBlank(nameSearch)) {
            String searchLikeName = '%' + nameSearch + '%';
            strSQL += ' AND Name LIKE :searchLikeName ';
        }
        if(String.isNotBlank(phoneSearch)) {
            String searchLikePhone = '%' + phoneSearch + '%';
            strSQL += 'AND Phone__C LIKE :searchLikePhone ';
        }

        strSQL += ' ORDER BY Name ASC';

        return Database.query(strSQL);
    }

    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployeeList(){
        String strSQL = 'SELECT Id, Name, Phone__c, BirthDay__c, Email__c FROM Employee__c ORDER BY Name ASC';
        return Database.query(strSQL);
    }

    @AuraEnabled(cacheable=true)
    public static Employee__c getDetailEmployeeById(String employeeId){
        return [
            SELECT Id, Name, Email__c, Phone__c, BirthDay__c, Memo__c 
            FROM Employee__c 
            WHERE Id = :employeeId
        ];
    }
    @AuraEnabled
    public static string upSertEmployee(Employee__c objEmployee, Boolean isAdd){
        if (isAdd) {
            return '';
        } else {
            return '';
        }
    }

    @AuraEnabled
    public static String insertEmployee(EmployeeModel model){
        // khoi tao map luu thong bao
        Map<String, Object> result = new Map<String, Object>();
        //khoi tao va khai báo doi tuong employee
        Employee__c employeeObj = new Employee__c();

        if(model.Id != null){
            // kiem tra ton tai cua employee
            List<Employee__C> getEmployeeById = [SELECT Id FROM Employee__C WHERE Id = :model.Id];
            if(getEmployeeById.size() == 0) {
                // thong bao khi update 1 employee khong ton tai
                result.put('title', 'Error!');
                result.put('message', 'Employee is not exist!');
                result.put('variant', 'error');
                return JSON.serialize(result);
            }
            employeeObj.Id = model.Id;

        }
        employeeObj.Name = model.Name;
        employeeObj.Email__c = model.Email;
        employeeObj.Phone__c = model.Phone;
        employeeObj.BirthDay__c = model.BirthDay;
        employeeObj.Memo__c = model.Memo;

        // save to DB
        upsert employeeObj;
        // thong bao khi insert hoac update thanh cong
        result.put('title', 'Success!');
        result.put('message', 'Employee is saved successfully!');
        result.put('variant', 'success');
        return JSON.serialize(result);
    }
}
