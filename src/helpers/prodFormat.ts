import { ProdSQL, ProdStruct } from "src/interfaces/interfaces";

  
const checkIfExist = (arrProdToAnalyze:ProdStruct[], prodSQL:ProdSQL):boolean => {
  for(let prodToAnalize of arrProdToAnalyze){
    if(prodToAnalize.SKU === prodSQL.SKU){
      return true;
    }
  }
  return false;
}

export const convertSQLToObject = (prodSQL:ProdSQL[]):ProdStruct[] => {
  let productStructure:ProdStruct[] = [];
  
  prodSQL.forEach(prod => {
    if(checkIfExist(productStructure, prod)){
      const index = productStructure.indexOf(productStructure.find(p=> p.SKU === prod.SKU) as ProdStruct)
      productStructure[index].attributes.push({
        name: prod.attribute,
        measureUnit: prod.measureUnit,
        value: prod.value,
      })
    } else{
      productStructure.push(
        {
          SKU: prod.SKU,
          name: prod.name,
          price: prod.price,
          type: prod.type,
          attributes: [
            {
              name: prod.attribute,
              measureUnit: prod.measureUnit,
              value: prod.value
            } 
          ]
        }
      );
    }
  });

  return productStructure
}
  