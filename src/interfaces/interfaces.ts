
export interface ProdSQL {
  SKU: number,
  name: string,
  price: number,
  type: string,
  attribute: string,
  measureUnit: string,
  value: number
}

export interface ProdStruct {
  SKU: number,
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
