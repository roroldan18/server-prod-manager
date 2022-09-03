import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import { QueryTypes } from 'sequelize';
import db from '../bin/connection';
import { ProdSQL } from 'src/interfaces/interfaces';
import { convertSQLToObject } from '../helpers/prodFormat';

// Constants
const router = Router();
const { CREATED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = StatusCodes;

// Paths
export const p = {
    get: '/',
    add: '/',
    delete: '/:SKU',
    getAtt: '/attributes/',
    getTypes: '/types/',
} as const;

/**
 * Get all products with its info.
 */
router.get(p.get, async (_: Request, res: Response) => {
  const query = `SELECT p.SKU, p.name, p.price, t.name as "type", a.name as "attribute", a.measureUnit, pa.value FROM product as p
  JOIN type_product as t ON p.type_product_idtype_product=t.idtype_product
  JOIN product_has_attribute as pa ON p.SKU=pa.product_SKU
  JOIN attribute as a ON pa.attribute_idattribute=a.idattribute`;

  try {
    const products:ProdSQL[] = await db.query(query, {type: QueryTypes.SELECT });
    return res.status(OK).json(convertSQLToObject(products));
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR);
  }
});

/**
 * Get attribute with name
 */
router.post(p.getAtt, async (req: Request, res: Response) => {
  const { attributes } = req.body;
  
  //Ver validacion
  if(attributes[0] === {}){
    return res.status(BAD_REQUEST).json({
      message: 'No name of attribute'
    });    
  }
  

  try {
    const queryGetAllAtt = `Select * FROM attribute;`
    const allAtt = await db.query(queryGetAllAtt, {type: QueryTypes.SELECT });
    
    
    let objAtt:attributeJSON[] = [];
    
    Object.keys(attributes[0]).forEach(key => {
  
      const att:any =  allAtt.find( (att:any) => att.name ===  key);
      let idAt:number;
  
      if(att){
        idAt = att.idattribute;
        objAtt.push({
          idAttribute: idAt,
          value: attributes[0][key]
        })
      }
    })
    
    return res.status(OK).json(objAtt);
    
  } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR);    
  }
});
/**
 * Get typeId with name
 */
router.post(p.getTypes, async (req: Request, res: Response) => {

  const type = Object.keys(req.body)[0];

  if(type === '' ||  !type){
    return res.status(BAD_REQUEST).json({
      message: 'No name of type'
    });    
  }
  
  try {
    const queryGetType = `Select * FROM type_product WHERE name="${type}";`
    const getType:any = await db.query(queryGetType, {type: QueryTypes.SELECT });
    return res.status(OK).json(getType[0].idtype_product);
    
  } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR);    
  }
});


export interface attributeJSON {
  idAttribute: number,
  value: number,
}
/**
 * Add one product.
 */
router.post(p.add, async (req: Request, res: Response) => {

  const { SKU, name, price, type, attributes } = req.body;  
  
  // Check if some value is missing
  if( !SKU || !name || !price || !type || !attributes || attributes.length === 0 ){
    return res.status(BAD_REQUEST).json({
      message: 'Some value is missing'
    });
  }
  
  // 1.Validate if product exists --> OK
  const queryProdSKU = `SELECT * FROM product WHERE SKU=${parseInt(SKU)}`;
  const prodWithSKU:ProdSQL[]|[] = await db.query(queryProdSKU, {type: QueryTypes.SELECT });
  if(prodWithSKU.length>0){
    return res.status(BAD_REQUEST).json({
      message: 'The product SKU already exists'
    });
  }

  // 2.Check if attributes are in type --> OK
  await attributes.forEach( async(att:attributeJSON) => {
    const queryTypesAtt = `SELECT * FROM type_product_has_attribute WHERE type_product_idtype_product=${type} AND attribute_idattribute=${att.idAttribute};`
    const typesAtt = await db.query(queryTypesAtt, {type: QueryTypes.SELECT });
    if(typesAtt.length === 0){
      return res.status(BAD_REQUEST).json({
        message: 'The attribute assigned not match with the product type'
      });
    }
  })


  const queryAtt = `SELECT * FROM type_product_has_attribute WHERE type_product_idtype_product=${type};`
  const totalAtt = await db.query(queryAtt, {type: QueryTypes.SELECT });

  // 3. Check if all attributes were sent
  if(totalAtt.length !== attributes.length){
    return res.status(BAD_REQUEST).json({
      message: 'Attributes missing on the product type'
    });
  }


  // Once pass every validation, create the transaction
    let t = await db.transaction();

    try {
      // 3. INSERT PRODUCT
      await db.query("INSERT INTO product (SKU, name, price, type_product_idtype_product) VALUES (?,?,?,?);", {replacements: [parseInt(SKU), name, price, type]});

      // 4. INSERT PRODUCT_ATTRIBUTE
      await attributes.forEach(async (att:attributeJSON) => {
        await db.query("INSERT INTO product_has_attribute(product_SKU, attribute_idattribute, value) VALUES (?,?,?);", {replacements: [parseInt(SKU), att.idAttribute, att.value]});
      });

      // 5. COMMIT
      await t.commit();
      
      // 6. COMMITED
      return res.status(CREATED).json({message: 'Product added successfully'}
      ); 

    } catch (error) {
      // 7. MANAGE ROLLBACK IN CASE OF ERROR
      const rollback = await t.rollback();
      return res.status(INTERNAL_SERVER_ERROR).json({
        data: error,
        rollback
      });
    }
});



/**
 * Delete one product
 */
router.delete(p.delete, async (req: Request, res: Response) => {
  // Take SKU from params
    const { SKU } = req.params;
    // 1. Check param
    if (!SKU) {
      return res.status(BAD_REQUEST).json({
        message: 'SKU is missing for delete'
      });
    }

    try{
      // 2. Confirm if product exists
      const queryProdSKU = `SELECT * FROM product WHERE SKU=${parseInt(SKU)}`;
      const prodWithSKU:ProdSQL[]|[] = await db.query(queryProdSKU, {type: QueryTypes.SELECT });
      if(prodWithSKU.length===0){
        return res.status(BAD_REQUEST).json({
          message: 'The product SKU does not exist'
        });
      }
  
  
      // 1. Create transaction
      await db.query("START TRANSACTION");
      // 2. Delete all attributes for the SKU
      await db.query(`DELETE FROM product_has_attribute WHERE product_SKU=${parseInt(SKU)}`)
      // 3. Delete product
      await db.query(`DELETE FROM product WHERE SKU=${parseInt(SKU)}`)
      // 4. Commit transaction
      const commit = await db.query("COMMIT");
        
      return res.status(OK).json({
        data: commit,
        message: 'Product deleted'}
      );
    } catch (error){
      const rollback = await db.query("rollback");
      return res.status(INTERNAL_SERVER_ERROR).json({
        data: error,
        message: error,
        rollback
      });
    }
});


// Export default
export default router;
