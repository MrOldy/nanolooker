import React from "react";

export interface ContextProps extends CoingeckoResult {
  isLoading: boolean;
  isInitialLoading: boolean;
  isError: boolean;
}

export interface CoingeckoResult {
  marketCapRank: number;
  usdMarketCap: number;
  marketCapChangePercentage24h: number;
  usd24hVolume: number;
  usdCurrentPrice: number;
  usd24hChange: number;
  totalSupply: number;
  circulatingSupply: number;
  usdBtcCurrentPrice: number;
}

const GET_DATA_TIMEOUT = 180 * 1000;

export const CoingeckoContext = React.createContext<ContextProps>(
  {} as ContextProps
);

const Provider: React.FC = ({ children }) => {
  const [data, setData] = React.useState<CoingeckoResult>(
    {} as CoingeckoResult
  );
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getCoingeckoData = async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      const resBtcPrice = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );

      const {
        bitcoin: { usd: usdBtcCurrentPrice }
      } = await resBtcPrice.json();

      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true"
      );

      const {
        market_cap_rank: marketCapRank,

        market_data: {
          market_cap_change_percentage_24h: marketCapChangePercentage24h,
          market_cap: { usd: usdMarketCap },
          total_volume: { usd: usd24hVolume },
          current_price: { usd: usdCurrentPrice },
          price_change_percentage_24h: usd24hChange,
          total_supply: totalSupply,
          circulating_supply: circulatingSupply
        }
      } = await res.json();

      const data = {
        marketCapRank,
        usdMarketCap,
        marketCapChangePercentage24h,
        usd24hVolume,
        usdCurrentPrice,
        usd24hChange,
        totalSupply,
        circulatingSupply,
        usdBtcCurrentPrice
      };

      setData(data);
      setIsLoading(false);
      setIsInitialLoading(false);
      setTimeout(() => getCoingeckoData(), GET_DATA_TIMEOUT);
    } catch (e) {
      setIsError(true);
    }
  };

  React.useEffect(() => {
    getCoingeckoData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CoingeckoContext.Provider
      value={{ ...data, isLoading, isInitialLoading, isError }}
    >
      {children}
    </CoingeckoContext.Provider>
  );
};

export default Provider;
