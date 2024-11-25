global Interface IGenerateReqestOrder {
 	/**
    * @description 
    * @author CommerceCx | 13-02-2024
    * @param Map<Id Object> scopeObjectLst 
    * @param ; 
    **/
    void onAddToCart(List<Object> scopeObjectLst);
    
    void onBackToCart();
    List<Object> getProductData();
}