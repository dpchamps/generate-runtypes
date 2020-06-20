import * as RT from 'runtypes' 
export const StoreAddress = RT.Record({
  address1: RT.String,
  city: RT.String,
  country: RT.String,
  postalCode: RT.String,
  state: RT.String,
});
export type StoreAddress = RT.Static<typeof StoreAddress>;
export const AnonymousSchema3 = RT.Record({
  name: RT.String,
  method: RT.String,
});
export type AnonymousSchema3 = RT.Static<typeof AnonymousSchema3>;
export const AnonymousSchema2 = RT.Record({
  status: RT.String,
  quantity: RT.Number,
  methods: RT.Array(AnonymousSchema3),
  storeName: RT.String,
  storeAddress: StoreAddress,
  usstoreId: RT.Number,
});
export type AnonymousSchema2 = RT.Static<typeof AnonymousSchema2>;
export const ShippingOptions = RT.Record({
  SCHEDULED_DELIVERY: RT.Array(AnonymousSchema2),
  SCHEDULED_PICKUP: RT.Array(AnonymousSchema2),
});
export type ShippingOptions = RT.Static<typeof ShippingOptions>;
export const PtcProperties = RT.Record({
  isOgDisplay: RT.Boolean,
});
export type PtcProperties = RT.Static<typeof PtcProperties>;
export const PtcId = RT.Record({
  key: RT.String,
  keyType: RT.String,
});
export type PtcId = RT.Static<typeof PtcId>;
export const Prop1 = RT.Record({
  valueRank: RT.String,
  displayName: RT.String,
});
export type Prop1 = RT.Static<typeof Prop1>;
export const Values = RT.Record({
  1: Prop1,
  2: Prop1,
  3: Prop1,
  4: Prop1,
  5: Prop1,
  6: Prop1,
  7: Prop1,
  8: Prop1,
  9: Prop1,
  10: Prop1,
  11: Prop1,
  12: Prop1,
  13: Prop1,
  14: Prop1,
  15: Prop1,
  16: Prop1,
  17: Prop1,
  18: Prop1,
  19: Prop1,
  20: Prop1,
  21: Prop1,
  22: Prop1,
  23: Prop1,
  24: Prop1,
  25: Prop1,
  26: Prop1,
  27: Prop1,
  28: Prop1,
  29: Prop1,
  30: Prop1,
  31: Prop1,
  32: Prop1,
  33: Prop1,
  34: Prop1,
  35: Prop1,
  36: Prop1,
});
export type Values = RT.Static<typeof Values>;
export const Multipack_quantity = RT.Record({
  variantResourceType: RT.String,
  values: Values,
  searchVariantDisplay: RT.String,
  displayName: RT.String,
  attributeRank: RT.String,
});
export type Multipack_quantity = RT.Static<typeof Multipack_quantity>;
export const PtcInfo = RT.Record({
  multipack_quantity: Multipack_quantity,
});
export type PtcInfo = RT.Static<typeof PtcInfo>;
export const TypeCanonical = RT.Record({
  ptcInfo: PtcInfo,
  ptcId: PtcId,
  ptcProperties: PtcProperties,
  productTypeId: RT.String,
});
export type TypeCanonical = RT.Static<typeof TypeCanonical>;
export const OfferAttributes = RT.Record({
  snapEligible: RT.String,
});
export type OfferAttributes = RT.Static<typeof OfferAttributes>;
export const ProductAttributes = RT.Record({
  karf_sales_unit: RT.String,
  karf_primary_department_id: RT.String,
  karf_maximum_order_quantity: RT.String,
  rh_path: RT.String,
  price_per_unit_quantity: RT.String,
  karf_substitutions_allowed: RT.String,
  sku_id: RT.String,
  karf_commodity_group_drive: RT.String,
  product_pt_family: RT.String,
  karf_maximum_quantity_factor: RT.String,
  product_tax_code: RT.String,
  is_perishable: RT.String,
  product_url_text: RT.String,
  price_per_unit_uom: RT.String,
  karf_commodity_group: RT.String,
  karf_is_alcohol: RT.String,
  merchandise_commerce_number: RT.String,
  primary_shelf_id: RT.String,
  karf_primary_aisle_id: RT.String,
  sku: RT.String,
  age_restriction: RT.String,
});
export type ProductAttributes = RT.Static<typeof ProductAttributes>;
export const MarketingAttributes = RT.Record({
  rh_path: RT.String,
  wm_dept_num: RT.String,
});
export type MarketingAttributes = RT.Static<typeof MarketingAttributes>;
export const AnonymousSchema1 = RT.Record({
  60: RT.String,
  100: RT.String,
});
export type AnonymousSchema1 = RT.Static<typeof AnonymousSchema1>;
export const Assets = RT.Record({
  primary: RT.Array(AnonymousSchema1),
});
export type Assets = RT.Static<typeof Assets>;
export const ComparisonPrice = RT.Record({
  isStrikethrough: RT.Boolean,
  isEligibleForAssociateDiscount: RT.Boolean,
  isRollback: RT.Boolean,
  isReducedPrice: RT.Boolean,
  isClearance: RT.Boolean,
  hidePriceForSOI: RT.Boolean,
});
export type ComparisonPrice = RT.Static<typeof ComparisonPrice>;
export const Seller = RT.Record({
  name: RT.String,
  type: RT.String,
  id: RT.String,
});
export type Seller = RT.Static<typeof Seller>;
export const AnonymousSchema = RT.Record({
  id: RT.String,
  quantity: RT.Number,
  price: RT.Number,
  linePrice: RT.Number,
  unitValuePrice: RT.Number,
  unitValuePriceType: RT.String,
  USItemId: RT.String,
  USSellerId: RT.String,
  legacyItemId: RT.String,
  upc: RT.String,
  wupc: RT.String,
  offerId: RT.String,
  gtin: RT.String,
  name: RT.String,
  manufacturerProductId: RT.String,
  productClassType: RT.String,
  seller: Seller,
  currentPriceType: RT.String,
  comparisonPrice: ComparisonPrice,
  assets: Assets,
  marketingAttributes: MarketingAttributes,
  productAttributes: ProductAttributes,
  offerAttributes: OfferAttributes,
  availableQuantity: RT.Number,
  maxItemCountPerOrder: RT.Number,
  twoDayShippingEligible: RT.Boolean,
  pickupDiscountEligible: RT.Boolean,
  toOverrideIROPrice: RT.Boolean,
  salesUnit: RT.String,
  itemClassId: RT.String,
  manufacturerName: RT.String,
  brand: RT.String,
  productSegment: RT.String,
  productType: RT.String,
  wmtItemNum: RT.String,
  gSkuId: RT.String,
  isConsumable: RT.Boolean,
  typeCanonical: TypeCanonical,
  type: RT.String,
  unitOfMeasure: RT.String,
  sort: RT.Number,
  shippingOptions: ShippingOptions,
  isWarrantyEligible: RT.Boolean,
  isServicePlansEligible: RT.Boolean,
  isAlcohol: RT.Boolean,
  isSnapEligible: RT.Boolean,
  substitutable: RT.Boolean,
  isSubstitutionsAllowed: RT.Boolean,
  weightIncrement: RT.Number,
});
export type AnonymousSchema = RT.Static<typeof AnonymousSchema>;
export const SelectedSlot = RT.Record({
  id: RT.String,
  startTime: RT.Number,
  endTime: RT.Number,
  cutoffTime: RT.Number,
  price: RT.Number,
  slaInMins: RT.Number,
  priority: RT.Number,
  fulfillmentType: RT.String,
  date: RT.Number,
  day: RT.String,
});
export type SelectedSlot = RT.Static<typeof SelectedSlot>;
export const Reservation = RT.Record({
  id: RT.String,
  expiryTime: RT.Number,
  expired: RT.Boolean,
  crowdSourceCarrier: RT.String,
  selectedSlot: SelectedSlot,
});
export type Reservation = RT.Static<typeof Reservation>;
export const AccessPoint = RT.Record({
  id: RT.String,
  name: RT.String,
  storeId: RT.Number,
  minimumPurchase: RT.Number,
  fulfillmentType: RT.String,
  supportedTimeZone: RT.String,
  isCrowdSourced: RT.Boolean,
  isStoreEbtEligible: RT.Boolean,
  allowAlcohol: RT.Boolean,
  allowAgeRestricted: RT.Boolean,
});
export type AccessPoint = RT.Static<typeof AccessPoint>;
export const Totals = RT.Record({
  subTotal: RT.Number,
  shippingTotal: RT.Number,
  hasSurcharge: RT.Boolean,
  grandTotal: RT.Number,
  addOnServicesTotal: RT.Number,
  itemsSubTotal: RT.Number,
});
export type Totals = RT.Static<typeof Totals>;
export const ItemCountByType = RT.Record({
  regular: RT.Number,
});
export type ItemCountByType = RT.Static<typeof ItemCountByType>;
export const Location = RT.Record({
  postalCode: RT.String,
  city: RT.String,
  stateOrProvinceCode: RT.String,
  countryCode: RT.String,
  isDefault: RT.Boolean,
  addressLineOne: RT.String,
});
export type Location = RT.Static<typeof Location>;
export const Cart = RT.Record({
  id: RT.String,
  type: RT.String,
  preview: RT.Boolean,
  customerId: RT.String,
  location: Location,
  storeIds: RT.Array(RT.Number),
  itemCount: RT.Number,
  currencyCode: RT.String,
  itemCountByType: ItemCountByType,
  hasSubmapTypeItem: RT.Boolean,
  totals: Totals,
  savedItemCount: RT.Number,
  shipMethodDefaultRule: RT.String,
  tenantId: RT.Number,
  verticalId: RT.Number,
  localeId: RT.String,
  accessPoint: AccessPoint,
  reservation: Reservation,
  hasAlcoholicItem: RT.Boolean,
  ebtLastVerifiedTime: RT.Number,
  isEbtCustomer: RT.Boolean,
});
export type Cart = RT.Static<typeof Cart>;
export const JSONSchema = RT.Record({
  checkoutable: RT.Boolean,
  cart: Cart,
  items: RT.Array(AnonymousSchema),
  nextDayEligible: RT.Boolean,
  eDeliveryCart: RT.Boolean,
  canAddWARPItemToCart: RT.Boolean,
  cartVersion: RT.Number,
});
export type JSONSchema = RT.Static<typeof JSONSchema>;
