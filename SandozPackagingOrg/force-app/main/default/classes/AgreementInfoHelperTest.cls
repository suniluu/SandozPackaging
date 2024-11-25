@isTest
private class AgreementInfoHelperTest {
	
    @isTest
    static void testAgreements() {
    	Contact testContact = new Contact();
        testContact.lastname='Test';
        insert testContact;
        
        Test.startTest();
        AgreementInfoHelper.getObjectNameById(testContact.Id);
        List<String> lstString = AgreementInfoHelper.getFieldSetFields('Account','test');
        
        System.assertNotEquals(null, lstString, 'List of records should not be null');
        
        Test.stopTest();
    }
}