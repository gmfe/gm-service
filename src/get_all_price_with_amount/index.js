import Big from 'big.js'

function getAllPriceWithAmount (amount, saleRatio, salePrice, stdSalePrice) {
  const integerPart = Big(parseInt(+Big(amount).div(saleRatio), 10))
  const decimalPart = Big(amount).mod(saleRatio)

  // 整数倍读取销售价 剩下的用单价
  return +integerPart.times(salePrice).plus(decimalPart.times(stdSalePrice))
}

export default getAllPriceWithAmount
