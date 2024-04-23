"use client";

import { FC, createContext, useContext, useMemo, useReducer } from "react";
//TODO: Add types once token types are defined

type Action =
	| { type: "swapTokens" }
	| { type: "setToken0"; value: any }
	| { type: "setToken1"; value: any }
	| { type: "setIsTxnPending"; value: boolean };

type Dispatch = {
	swapTokens(): void;
	setToken0(token: any): void;
	setToken1(token: any): void;
	setIsTxnPending(isPending: boolean): void;
};

type State = {
	token0: any;
	token1: any;
	isTxnPending: boolean;
};

type SwapProviderProps = { children: React.ReactNode };

const SwapContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function swapReducer(_state: State, action: Action) {
	switch (action.type) {
		case "setToken0": {
			return { ..._state, token0: action.value };
		}
		case "setToken1": {
			return { ..._state, token1: action.value };
		}
		case "swapTokens": {
			return { ..._state, token0: _state.token1, token1: _state.token0 };
		}
		case "setIsTxnPending": {
			return { ..._state, isTxnPending: action.value };
		}
		// default: {
		// 	throw new Error(`Unhandled action type: ${action.type}`);
		// }
	}
}

const SwapProvider: FC<SwapProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(swapReducer, { token0: "0", token1: "1", isTxnPending: false });

	const dispatchWithAction = useMemo(
		() => ({
			setToken0: (value: any) => dispatch({ type: "setToken0", value }),
			setToken1: (value: any) => dispatch({ type: "setToken1", value }),
			swapTokens: () => dispatch({ type: "swapTokens" }),
			setIsTxnPending: (value: boolean) => dispatch({ type: "setIsTxnPending", value }),
		}),
		[dispatch]
	);

	return (
		<SwapContext.Provider
			value={useMemo(() => {
				return { state, dispatch: dispatchWithAction };
			}, [state])}>
			{children}
		</SwapContext.Provider>
	);
};

const useSwapContext = () => {
	const context = useContext(SwapContext);
	if (!context) {
		throw new Error("Hook can only be used inside Swap Provider");
	}

	return context;
};

const useSwapState = () => {
	const context = useSwapContext();
	return context.state;
};

const useSwapDispatch = () => {
	const context = useSwapContext();
	return context.dispatch;
};

export { SwapProvider, useSwapState, useSwapDispatch };
