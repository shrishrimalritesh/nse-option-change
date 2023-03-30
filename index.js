const express = require('express');
const axios = require('axios');

const app = express();

function roundToNearest(number) {
  var roundingValue = 50;
  var roundedNumber = Math.round(number / roundingValue) * roundingValue;

  // Check if the rounded number is divisible by 50
  if (roundedNumber % 50 == 0) {
    return roundedNumber + 50;
  } else {
    return roundedNumber;
  }
}

app.get('/api/data', async (req, res) => {
  try {
    const response = await axios.get('https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY');
    const data = response.data;
    let expiryDate = data?.records?.expiryDates[0];
    let oiPE = 0
    let oiCE = 0
    let upperLimit = roundToNearest(data?.records?.underlyingValue)+400
    let lowerLimit = roundToNearest(data?.records?.underlyingValue)-400
    console.log(data,"data")
    let result = []
    data?.records?.data.filter(option =>{
        if( option.expiryDate === expiryDate && option.strikePrice <= upperLimit && option.strikePrice >= lowerLimit ){
          oiPE+= option['PE'].openInterest
          oiCE+= option['CE'].openInterest
          result.push(option)
        }
      });
      let mothiKon;
      let netOI;
      if (oiCE > oiPE){
        netOI = oiCE - oiPE;
        mothiKon ="oiCE"
      }else{
        netOI = oiPE - oiCE;
        mothiKon ="oiPE"
      }
      res.send({ resultLen: result.length, oiPE, oiCE, mothiKon, netOI });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
