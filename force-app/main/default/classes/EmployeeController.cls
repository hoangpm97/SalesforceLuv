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

    @AuraEnabled
    public static string upSertEmployee(Employee__c objEmployee, Boolean isAdd){
        if (isAdd) {
            return '';
        } else {
            return '';
        }
    }

}
