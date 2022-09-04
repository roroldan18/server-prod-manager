
export interface ProdSQL {
  SKU: string,
  name: string,
  price: number,
  type: string,
  attribute: string,
  measureUnit: string,
  value: number
}

export interface ProdStruct {
  SKU: string,
  name: string,
  price: number,
  type: string,
  attributes: attribute[],
}

export interface attribute {
    name: string,
    measureUnit: string,
    value: number
}
