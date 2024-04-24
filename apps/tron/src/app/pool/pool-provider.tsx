"use client";

import { FC, createContext, useContext, useMemo, useReducer } from "react";
//TODO: Add types once token types are defined

type Action =
	| { type: "setToken0"; value: any }
	| { type: "setToken1"; value: any }
	| { type: "setIsTxnPending"; value: boolean };

type Dispatch = {
	setToken0(token: any): void;
	setToken1(token: any): void;
	setIsTxnPending(isPending: boolean): void;
};

type State = {
	token0: any;
	token1: any;
	isTxnPending: boolean;
};

type PoolProviderProps = { children: React.ReactNode };

const PoolContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function swapReducer(_state: State, action: Action) {
	switch (action.type) {
		case "setToken0": {
			return { ..._state, token0: action.value };
		}
		case "setToken1": {
			return { ..._state, token1: action.value };
		}
		case "setIsTxnPending": {
			return { ..._state, isTxnPending: action.value };
		}
		// default: {
		// 	throw new Error(`Unhandled action type: ${action.type}`);
		// }
	}
}

const PoolProvider: FC<PoolProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(swapReducer, { token0: "0", token1: "1", isTxnPending: false });

	const dispatchWithAction = useMemo(
		() => ({
			setToken0: (value: any) => dispatch({ type: "setToken0", value }),
			setToken1: (value: any) => dispatch({ type: "setToken1", value }),

			setIsTxnPending: (value: boolean) => dispatch({ type: "setIsTxnPending", value }),
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
