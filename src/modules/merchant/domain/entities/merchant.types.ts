import { registerEnumType } from '@nestjs/graphql'

export enum AdvantageForm {
  CASHBACK = 'CASHBACK',
  PROMO_CODE = 'PROMO_CODE',
}
export const advantageFormEnumName = 'advantage_form_enum'

registerEnumType(AdvantageForm, { name: advantageFormEnumName })

export enum PointOfSaleType {
  PHYSICAL = 'PHYSICAL',
  DELIVERY = 'DELIVERY',
}
export const pointOfSaleTypeEnumName = 'point_of_sale_type_enum'

registerEnumType(PointOfSaleType, { name: pointOfSaleTypeEnumName })

export enum PointOfSaleGradesType {
  BIO = 'BIO',
  LOCAL = 'LOCAL',
  VEGETARIAN = 'VEGETARIAN',
  ANTIWASTE = 'ANTIWASTE',
  NOWASTE = 'NOWASTE',
  INCLUSIVE = 'INCLUSIVE',
}
export const pointOfSaleGradesTypeEnumName = 'point_of_sale_grade_type_enum'

registerEnumType(PointOfSaleGradesType, {
  name: pointOfSaleGradesTypeEnumName,
})

// TO BE DELETED
export enum MerchantCategoryNameFilter {
  RESTAURANT = 'RESTAURANT',
  SUPERMARKET = 'SUPERMARKET',
  BAKERY = 'BAKERY',
  OTHER = 'OTHER',
}

export function getCategoryNameFilterFromMcc(
  mcc: string,
): MerchantCategoryNameFilter | undefined {
  switch (mcc) {
    case '5812':
    case '5814':
      return MerchantCategoryNameFilter.RESTAURANT
    case '5411':
      return MerchantCategoryNameFilter.SUPERMARKET
    case '5462':
      return MerchantCategoryNameFilter.BAKERY
    default:
      return MerchantCategoryNameFilter.OTHER
  }
}
