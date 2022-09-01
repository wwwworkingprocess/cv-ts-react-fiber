export type PriceInputEnvelope = {
  eth: number;
  alt: {
    hex: number;
    shib: number;
    cro: number;
  };
  sta: {
    //later
    usdt: number /*usdt */;
    usdc: number /*usdc */;
    busd: number /*busd */;
    dai: number /*dai */;
    sai: number /*sai */;
    mim: number /*mim */;
  };
  created: string; //new Date().toTimeString().split(' ')[0]
};

const useCoinGeckoPrices = () => {
  //
  //
  //
  const getExtendedPricesLandindPage = async (): Promise<any> => {
    const geckos = [
      "bitcoin",
      "ethereum",
      "game",
      "lbry-credits",
      "neo",
      "steem",
      "litecoin",
      "notional-finance",
      "mint-asset",
      "iota",
      "dash",
    ];
    //
    const ids = geckos.join(","); //'ethereum,hex,shiba-inu,crypto-com-chain';
    const gecko_uri = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=USD`;
    //
    const response = await fetch(gecko_uri);
    console.log("res", response);
    const json = await response.json();
    console.log("json", json);
    //
    const prices = json as Record<string, Record<string, number>>;

    console.log("frontend prices extended", prices);
    //
    //  const new_price = res["ethereum"] ? res["ethereum"]["usd"] : 0;
    //

    const tickers = [
      "BTC",
      "ETH",
      "GAME",
      "LBC",
      "NEO",
      "STEEM",
      "LTC",
      "NOTE",
      "MINT",
      "IOTA",
      "DASH",
    ];
    //
    // console.log('prices', prices, 'tickers', tickers);
    //
    for (const [geckoId, priceObj] of Object.entries(prices)) {
      const usd = (priceObj as any).usd;
      const arridx = geckos.indexOf(geckoId) || 0;
      const ticker = tickers[arridx];
      //
      // console.log('processing', arridx, geckoId, priceObj);
      //
      // const ctrl = $(
      //   'li[data-update="item' + arridx + '"]',
      //   $("#webticker-dark-icons")
      // );
      // const newh = one_li(ticker, usd, arridx);
      // ctrl.html(newh);
    }
    // end-fetch-ok
    return prices;
  };

  //
  //
  //
  const getPairBasePricesFromCoinGecko = async (): Promise<any> => {
    const geckos = [
      "bitcoin", // -> wbtc
      "ethereum", // -> weth
      "dai", // -> dai
      "tether", // -> usdt
      "usd-coin", // -> usdc
      "sushi", // -> sushi
    ];
    //
    const ids = geckos.join(","); //'ethereum,hex,shiba-inu,crypto-com-chain';
    const gecko_uri = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=USD`;
    //
    const response = await fetch(gecko_uri);
    console.log("res", response);
    const json = await response.json();
    console.log("json", json);
    //
    const prices = json as Record<string, Record<string, number>>;

    console.log("frontend getPairBasePricesFromCoinGecko extended", prices);
    //
    //  const new_price = res["ethereum"] ? res["ethereum"]["usd"] : 0;
    //

    const tickers = [
      "BTC",
      "ETH",
      "GAME",
      "LBC",
      "NEO",
      "STEEM",
      "LTC",
      "NOTE",
      "MINT",
      "IOTA",
      "DASH",
    ];
    //
    console.log("prices extended", prices, "tickers", tickers);
    //
    /*
          bitcoin: {usd: 38967}
          dash: {usd: 95.81}
          ethereum: {usd: 2719.47}
          game: {usd: 0.00232951}
          iota: {usd: 0.778664}
          lbry-credits: {usd: 0.0312629}
          litecoin: {usd: 110.71}
          mint-asset: {usd: 0.00498959}
          neo: {usd: 20.96}
          notional-finance: {usd: 1.027}
          steem: {usd: 0.330026}
        */
    //
    for (const [geckoId, priceObj] of Object.entries(prices)) {
      const usd = (priceObj as any).usd;
      const arridx = geckos.indexOf(geckoId) || 0;
      const ticker = tickers[arridx];
      //
      // console.log('processing', arridx, geckoId, priceObj);
      //
      // const ctrl = $(
      //   'li[data-update="item' + arridx + '"]',
      //   $("#webticker-dark-icons")
      // );
      // const newh = one_li(ticker, usd, arridx);
      // ctrl.html(newh);
    }
    // end-fetch-ok
    return prices;
  };

  //
  //
  //
  const getEthereumPriceFromCoinGecko =
    async (): Promise<PriceInputEnvelope> => {
      //
      // https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
      //
      const ids = "ethereum,hex,shiba-inu,crypto-com-chain";
      const currency = "usd";
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`;
      //
      console.log("downloading from", url);

      const response = await fetch(url);
      console.log("res", response);
      const json = await response.json();
      console.log("json", json);
      //
      const res = json as Record<string, Record<string, number>>;

      console.log("frontend prices", res);

      /*
      alts: 
      "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39": "hex",
      "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": "shib",
      "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b": "cro",
      */
      const geckoMap = {
        "crypto-com-chain": "cro",
        "shiba-inu": "shib",
      };
      //
      const new_price = res["ethereum"] ? res["ethereum"]["usd"] : 0;
      const new_price_hex = res["hex"] ? res["hex"]["usd"] : 0;
      const new_price_shib = res["shiba-inu"] ? res["shiba-inu"]["usd"] : 0;
      const new_price_cro = res["crypto-com-chain"]
        ? res["crypto-com-chain"]["usd"]
        : 0;
      //
      const prices = {
        eth: new_price,
        alt: {
          hex: new_price_hex,
          shib: new_price_shib,
          cro: new_price_cro,
        },
        sta: {
          //later
          usdt: 1 /*usdt */,
          usdc: 1 /*usdc */,
          busd: 1 /*busd */,
          dai: 1 /*dai */,
          sai: 1 /*sai */,
          mim: 1 /*mim */,
        },
        created: new Date().toTimeString().split(" ")[0],
      };

      //
      // console.log("GECKO res", res);
      // console.log("GECKO price", new_price);
      // console.log("GECKO price (hex)", new_price_hex);
      // console.log("GECKO PRICES", prices);
      //
      return prices;
    };

  //
  //
  //
  return {
    getEthereumPriceFromCoinGecko,
    getPairBasePricesFromCoinGecko,
    getExtendedPricesLandindPage,
  };
};

export default useCoinGeckoPrices;
