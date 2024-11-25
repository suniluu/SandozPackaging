global Interface IGenerateReqestOrder_V2 {
	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    void fastOrderAddToCart(String recId, List<Object> scopeObjectLst);
    
    void contractedProductsAddToCart(String recId,List<Object> scopeObjectLst);
    
    void reorderAddToCart(String recId,List<Object> scopeObjectLst);
    
    PageReference onBackToCart(String recId);
    
    List<Object> getQuickOrderData(String recId);
    
    List<Object> getReOrderData(String recId);
    
    List<Object> getPricingData(String recId);
    
    List<Object> getContractedData(String recId);
    
    List<Object> getPricingAggrementData(String productId);
    
    List<Object> fileUpload(String recId,String base64Data);
    
    Integer getCartRecordCount(String recId);
    
    void errorHandleling(String recId, Exception e);
}