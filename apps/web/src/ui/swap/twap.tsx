"use client";
import {
  TWAP as TwapContainer,
  isSupportedChain,
} from "@orbs-network/twap-ui-sushiswap";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@sushiswap/ui";

import { Currency, Token, Type } from "sushi/currency";
import { TokenSelector } from "src/lib/wagmi/components/token-selector/TokenSelector";
import {
  useDerivedStateSimpleSwap,
  useSimpleSwapTrade,
} from "./simple/derivedstate-simple-swap-provider";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useSortedTokenList } from "src/lib/wagmi/components/token-selector/hooks/useSortedTokenList";
import { useCustomTokens } from "@sushiswap/hooks";
import {
  useOtherTokenListsQuery,
  usePrice,
  useTokens,
} from "@sushiswap/react-query";
import { ChainId } from "sushi";
import { useTheme } from "next-themes";
import { SimpleSwapSettingsOverlay } from "./simple/simple-swap-settings-overlay";
import { SwapModeButtons } from "./swap-mode-buttons";
import { SimpleSwapHeader } from "./simple/simple-swap-header";
import { SimpleSwapBridgeBanner } from "./simple/simple-swap-bridge-banner";

const LOGO = {
  [ChainId.BASE]: "ethereum.svg",
  [ChainId.ARBITRUM]: "ethereum.svg",
};

const Modal = ({
  open,
  onClose,
  title,
  children,
  header,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  header?: ReactNode;
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        {" "}
        <DialogHeader>
          {header}
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

const TokenSelectModal = ({
  selected,
  children,
  onSelect,
}: {
  selected: any;
  children: ReactNode;
  onSelect: (currency: Type) => void;
}) => {
  const chainId = useDerivedStateSimpleSwap().state.chainId;

  return (
    <TokenSelector
      id={`twap-token-selector`}
      selected={selected}
      chainId={chainId}
      onSelect={onSelect}
      includeNative={true}
      hidePinnedTokens={false}
      hideSearch={false}
    >
      {children}
    </TokenSelector>
  );
};

export const useProvider = () => {
  const [provider, setProvider] = useState<any>(undefined);
  const { connector, address } = useAccount();
  const chainId = useChainId();

  const setProviderFromConnector = useCallback(async () => {
    setProvider(undefined);
    try {
      const res = await connector?.getProvider();
      setProvider(res);
    } catch (error) {}
  }, [setProvider, connector, chainId, address]);

  useEffect(() => {
    setProviderFromConnector();
  }, [setProviderFromConnector]);

  return provider;
};

const useTrade = () => {
  const { data: trade } = useSimpleSwapTrade();
  const outAmount = trade?.amountOut?.quotient.toString();
  return {
    isLoading: !outAmount,
    outAmount: outAmount,
  };
};

const usePriceUSD = (address?: string) => {
  const chainId = useDerivedStateSimpleSwap().state.chainId;

  const { data: price } = usePrice({
    chainId,
    address,
    enabled: true,
  });

  return price?.toSignificant(6);
};

const getTokenLogo = (currency: Currency) => {
  try {
    const src = currency.isNative
      ? `native-currency/${LOGO[currency.chainId as keyof typeof LOGO]}`
      : `tokens/${currency.chainId}/${currency.wrapped.address}.jpg`;
    const params = ["f_auto", "c_limit", `w_${64}`];
    return `https://cdn.sushi.com/image/upload/${params.join(
      ","
    )}/d_unknown.png/${src}`;
  } catch (error) {
    return "";
  }
};

const useTokenList = () => {
  const { data: customTokenMap } = useCustomTokens();
  const chainId = useDerivedStateSimpleSwap().state.chainId;

  const { data: otherTokenMap } = useOtherTokenListsQuery({
    chainId,
    query: "",
  });
  const { data: defaultTokenMap } = useTokens({
    chainId,
  });

  const tokenMap = useMemo(() => {
    return {
      ...defaultTokenMap,
      ...otherTokenMap,
    };
  }, [defaultTokenMap, otherTokenMap]);

  const { data: sortedTokenList } = useSortedTokenList({
    query: "",
    customTokenMap,
    tokenMap,
    chainId,
    balancesMap: {},
    includeNative: true,
  });

  return sortedTokenList;
};

export const useIsTwapSupported = () => {
  const { state } = useDerivedStateSimpleSwap();

  return useMemo(() => isSupportedChain(state.chainId), [state.chainId]);
};

function Provider({ isLimit }: { isLimit?: boolean }) {
  const { openConnectModal } = useConnectModal();
  const provider = useProvider();
  const tokens = useTokenList();
  const { state, mutate } = useDerivedStateSimpleSwap();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // we do this to get an indication of market price for single token
    if (state.swapAmountString !== "1") {
      mutate.setSwapAmount("1");
    }
  }, [state.swapAmountString]);

  return (
    <div className="flex flex-col gap-4">
      <SimpleSwapBridgeBanner />
      <SimpleSwapHeader />
      <div className="flex items-center justify-between">
        <SwapModeButtons />
        <SimpleSwapSettingsOverlay />
      </div>

      <TwapContainer
        TokenSelectModal={TokenSelectModal}
        Modal={Modal}
        connect={openConnectModal}
        account={state.recipient}
        limit={isLimit}
        useTrade={useTrade}
        provider={provider}
        dappTokens={tokens}
        srcToken={state.token0}
        dstToken={state.token1}
        getTokenLogo={getTokenLogo}
        onSrcTokenSelected={mutate.setToken0}
        onDstTokenSelected={mutate.setToken1}
        useUSD={usePriceUSD}
        isDarkTheme={resolvedTheme === "dark"}
        onSwitchTokens={mutate.switchTokens}
        configChainId={state.chainId}
      />
    </div>
  );
}
export const LimitPanel = () => {
  return <Provider isLimit={true} />;
};

export const TWAPPanel = () => {
  return <Provider />;
};
