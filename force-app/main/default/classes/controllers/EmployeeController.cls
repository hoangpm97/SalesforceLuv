public with sharing class EmployeeController {

    private static EmployeeLogic employeeLogic = new EmployeeLogic();
    
    @AuraEnabled
    public static String doSearchEmployee(String nameSearch, String phoneSearch) {
        try {
            return employeeLogic.searchEmployee(nameSearch, phoneSearch);
        } catch (Exception ex) {
            return EmployeeUtil.returnErrorJsonFormat(ex.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String doEmployeeList(){
        try {
            return employeeLogic.getEmployeeList();
        } catch (Exception ex) {
            return EmployeeUtil.returnErrorJsonFormat(ex.getMessage());
        }
    }

    @AuraEnabled
    public static Employee__c doDetailEmployeeById(String employeeId) {
            return employeeLogic.getDetailEmployeeById(employeeId);
    
    }

    @AuraEnabled
    public static String doUpsertEmployee(EmployeeDto model) {
        try {
            return employeeLogic.upsertEmployee(model);
        } catch (Exception ex) {
            return EmployeeUtil.returnErrorJsonFormat(ex.getMessage());
        }
    }

    @AuraEnabled
    public static String doDeleteEmployee(String employeeId) {
        try {
            return employeeLogic.deleteEmployee(employeeId);
        } catch (Exception ex) {
            return EmployeeUtil.returnErrorJsonFormat(ex.getMessage());
        }
    }
    
    
}
