interface Exchange {
  name: string;
  logo: string;
  alt: string;
}

const exchanges: Exchange[] = [
  { name: "Binance", logo: "/exchange-logos/binance.png", alt: "Binance logo" },
  { name: "Bybit", logo: "/exchange-logos/bybit.png", alt: "Bybit logo" },
  { name: "Coinbase", logo: "/exchange-logos/coinbase.png", alt: "Coinbase logo" },
  { name: "OKX", logo: "/exchange-logos/okx.svg", alt: "OKX logo" },
  { name: "Kraken", logo: "/exchange-logos/kraken.svg", alt: "Kraken logo" },
  { name: "KuCoin", logo: "/exchange-logos/kucoin.png", alt: "KuCoin logo" },
  { name: "Gate.io", logo: "/exchange-logos/gateio.svg", alt: "Gate.io logo" },
  { name: "MEXC", logo: "/exchange-logos/mexc.png", alt: "MEXC logo" },
  { name: "Bitfinex", logo: "/exchange-logos/bitfinex.png", alt: "Bitfinex logo" },
  { name: "Bitstamp", logo: "/exchange-logos/bitstamp.png", alt: "Bitstamp logo" },
  { name: "BingX", logo: "/exchange-logos/bingx.png", alt: "BingX logo" },
];

export const ExchangeCarousel = () => {
  return (
    <div
      className="py-8"
      aria-label="Partner exchanges"
      role="region"
    >
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 max-w-4xl mx-auto">
        {exchanges.map((exchange) => (
          <div
            key={exchange.name}
            className="flex items-center justify-center p-4 md:p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
            role="img"
            aria-label={exchange.alt}
          >
            <img
              src={exchange.logo}
              alt={exchange.alt}
              className="h-7 md:h-9 w-auto object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
