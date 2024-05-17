"use client";

import { FC, createContext, useContext, useMemo, useReducer } from "react";
import { DEFAULT_TOKEN_LIST } from "src/constants/token-list";
import { IToken } from "src/types/token-type";

type Action =
	| { type: "setToken0"; value: IToken }
	| { type: "setToken1"; value: IToken }
	| { type: "setIsTxnPending"; value: boolean }
	| { type: "setAmountInToken0"; value: string }
	| { type: "setAmountInToken1"; value: string };

type Dispatch = {
	setToken0(token: IToken): void;
	setToken1(token: IToken): void;
	setIsTxnPending(isPending: boolean): void;
	setAmountInToken0(amount: string): void;
	setAmountInToken1(amount: string): void;
};

type State = {
	token0: IToken | undefined;
	token1: IToken | undefined;
	isTxnPending: boolean;
	amountInToken0: string;
	amountInToken1: string;
};

type PoolProviderProps = { children: React.ReactNode };

const PoolContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function poolReducer(_state: State, action: Action) {
	switch (action.type) {
		case "setToken0": {
			if (_state?.token1?.address === action.value.address) {
				//if token1 is the same as the new token0, swap them
				return { ..._state, token1: _state.token0, token0: action.value };
			}
			return { ..._state, token0: action.value };
		}
		case "setToken1": {
			if (_state?.token0?.address === action.value.address) {
				//if token0 is the same as the new token1, swap them
				return { ..._state, token0: _state.token1, token1: action.value };
			}
			return { ..._state, token1: action.value };
		}
		case "setIsTxnPending": {
			return { ..._state, isTxnPending: action.value };
		}
		case "setAmountInToken0": {
			return { ..._state, amountIn: action.value };
		}
		case "setAmountInToken1": {
			return { ..._state, amountIn: action.value };
		}
	}
}

const PoolProvider: FC<PoolProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(poolReducer, {
		token0: undefined,
		token1: undefined,
		isTxnPending: false,
		amountInToken0: "",
		amountInToken1: "",
	});

	const dispatchWithAction = useMemo(
		() => ({
			setToken0: (value: IToken) => dispatch({ type: "setToken0", value }),
			setToken1: (value: IToken) => dispatch({ type: "setToken1", value }),
			setIsTxnPending: (value: boolean) => dispatch({ type: "setIsTxnPending", value }),
			setAmountInToken0: (value: string) => dispatch({ type: "setAmountInToken0", value }),
			setAmountInToken1: (value: string) => dispatch({ type: "setAmountInToken1", value }),
		}),
		[dispatch]
	);

	return (
		<PoolContext.Provider
			value={useMemo(() => {
				return { state, dispatch: dispatchWithAction };
			}, [state])}>
			{children}
		</PoolContext.Provider>
	);
};

const usePoolContext = () => {
	const context = useContext(PoolContext);
	if (!context) {
		throw new Error("Hook can only be used inside Pool Provider");
	}

	return context;
};

const usePoolState = () => {
	const context = usePoolContext();
	return context.state;
};

const usePoolDispatch = () => {
	const context = usePoolContext();
	return context.dispatch;
};

export { PoolProvider, usePoolState, usePoolDispatch };
