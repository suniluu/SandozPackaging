global Interface IGenerateAgreementController {
 	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    
    List<Object> getAgreementHomePageFieldSet(String objectName);

    List<Object> getAgreementSummaryPageFieldSet(String objectName);

    void errorHandleling(String recId, Exception e);
    
    List<Object> getAgreementCatalogData(String recId, String fieldsData);
    
    List<Object> getAgreementFastData(String productId, String fieldsData , String selectedvalue);
    
    List<Object> fileUpload(String recId,String base64Data, String fieldsData);
    
    Object getAgreementFamilyProducts(String selectedvalue);
    
    List<Object> getAgreementProducts(String recordId);
    
    Object updateAgreementData(String recordId, List<Object> agreementData);

    Object updateAgreementLineItemData(String recordId, List<Object> agreementLineItemData);
    
    List<Object> updateProducts(String recordId, String saveDraftValues, String productData);
    
    List<Account> getCompanyLocations(String agrID);
}