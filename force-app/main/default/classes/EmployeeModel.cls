public with sharing class EmployeeModel {

    @AuraEnabled
    public String Id { get; set; }
    @AuraEnabled
    public String Email { get; set; }
    @AuraEnabled
    public String Name { get; set; }
    @AuraEnabled
    public String Memo { get; set; }
    @AuraEnabled
    public Date BirthDay { get; set; }
    @AuraEnabled
    public String Phone { get; set; }
}
