public with sharing class EmployeeController {
    private static final Integer LIMIT_RECORD_2001 = 2001;

    @AuraEnabled
    public static List<Employee__c> queryEmployees(String nameSearch, String phoneSearch){
        String strSQL = 'SELECT Id, Name, Phone__c, BirthDay__c, Email__c, Memo__c, LastModifiedDate ';
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

    @AuraEnabled
    public static String searchEmployees(String nameSearch, String phoneSearch) {
        Map<String, Object> result = new Map<String, Object>();
        Boolean isSearchingOverLimit = false;

        // max 2000 employees can return
        List<Employee__c> employees = queryEmployees(nameSearch, phoneSearch);
        if(LIMIT_RECORD_2001 == employees.size()) {
            isSearchingOverLimit = true;
            employees.remove(LIMIT_RECORD_2001 - 1);
        }

        // return
        result.put('isSearchingOverLimit', isSearchingOverLimit);
        result.put('employees', employees);
        return JSON.serialize(result);
    }

    @AuraEnabled(cacheable=true)
    public static String getEmployeeList(){
        Map<String, Object> result = new Map<String, Object>();
        Boolean isSearchingOverLimit = false;
        String strSQL = 'SELECT Id, Name, Phone__c, BirthDay__c, Email__c, Memo__c, LastModifiedDate FROM Employee__c ORDER BY Name ASC';
        List<Employee__c> employees = Database.query(strSQL);
        if(LIMIT_RECORD_2001 == employees.size()) {
            isSearchingOverLimit = true;
            employees.remove(LIMIT_RECORD_2001 - 1);
        }
        // return
        result.put('isSearchingOverLimit', isSearchingOverLimit);
        result.put('employees', employees);
        return JSON.serialize(result);
    }

    @AuraEnabled
    public static Employee__c getDetailEmployeeById(String employeeId){
        return [
            SELECT Id, Name, Email__c, Phone__c, BirthDay__c, Memo__c, LastModifiedDate
            FROM Employee__c 
            WHERE Id = :employeeId
        ];
    }

    @AuraEnabled
    public static String insertEmployee(EmployeeModel model){
        // khoi tao map luu thong bao
        Map<String, Object> result = new Map<String, Object>();
        //khoi tao va khai báo doi tuong employee
        Employee__c employeeObj = new Employee__c();

        if(model.Id != ''){
            // kiem tra ton tai cua employee
            List<Employee__C> getEmployeeById = [SELECT Id, LastModifiedDate FROM Employee__C WHERE Id = :model.Id];
            if(getEmployeeById.size() == 0) {
                // thong bao khi update 1 employee khong ton tai
                result.put('title', 'Error!');
                result.put('message', 'Employee is not exist!');
                result.put('variant', 'error');
                return JSON.serialize(result);
            }
            // validate modified date
            String lastModifiedDate = getEmployeeById[0].LastModifiedDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss');
            if(lastModifiedDate != model.LastModifiedDate) {
                result.put('title', 'Error!');
                result.put('message', 'Employee is out of date. Please refresh page again.');
                result.put('variant', 'error');
                result.put('lastModifiedDate', lastModifiedDate);
                
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
        result.put('empid', employeeObj.Id);
        if(model.Id != '') { 
            result.put('lastModifiedDate', getDetailEmployeeById(employeeObj.Id));
        }
        return JSON.serialize(result);
    }

    @AuraEnabled
    public static Employee__c getLastModifiedDate(String employeeId){
        return [
            SELECT LastModifiedDate
            FROM Employee__c 
            WHERE Id = :employeeId
        ];
    }

    @AuraEnabled
    public static String deleteEmployee(String employeeId) {

        Map<String, Object> result = new Map<String, Object>();

        List<Employee__C> employeeObj = [SELECT Id FROM Employee__C WHERE Id = :employeeId];
        if(employeeObj.size() == 0) {
            // thong bao khi update 1 employee khong ton tai
                result.put('title', 'Error!');
                result.put('message', 'Employee is not exist!');
                result.put('variant', 'error');
        } else {
            delete(employeeObj);
            result.put('title', 'Success!');
            result.put('message', 'Employee is deleted successfully!');
            result.put('variant', 'success');
        }
        return JSON.serialize(result);
    }
}
