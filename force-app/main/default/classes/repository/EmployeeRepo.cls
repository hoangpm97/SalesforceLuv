public with sharing class EmployeeRepo {

    public List<Employee__c> queryEmployees(String nameSearch, String phoneSearch){
        String strSQL = 'SELECT Id, Name, Phone__c, BirthDay__c, Email__c, Memo__c, LastModifiedDate, SrcAvatar__c ';
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

    public List<Employee__c> getEmployeeList() {
        String strSQL = 'SELECT Id, Name, Phone__c, BirthDay__c, Email__c, Memo__c, LastModifiedDate, SrcAvatar__c FROM Employee__c ORDER BY Name ASC';
        return Database.query(strSQL);

    }

    public Employee__c getDetailEmployeeById(String employeeId) {
        return [
            SELECT Id, Name, Email__c, Phone__c, BirthDay__c, Memo__c, LastModifiedDate, SrcAvatar__c
            FROM Employee__c 
            WHERE Id = :employeeId
        ];
    }

    public Employee__c getLastModifiedDate(String employeeId){
        return [
            SELECT LastModifiedDate
            FROM Employee__c
 
            WHERE Id = :employeeId
        ];
    }

    public List<Employee__c> checkEmployeeExists(String employeeId){
        return [
            SELECT Id, LastModifiedDate
            FROM Employee__c
 
            WHERE Id = :employeeId
        ];
    }

}
