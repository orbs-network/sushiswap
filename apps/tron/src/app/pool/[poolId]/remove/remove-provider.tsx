"use client";

import { FC, createContext, useContext, useMemo, useReducer } from "react";
import { IToken } from "src/types/token-type";

type Action =
	| { type: "setToken0"; value: IToken }
	| { type: "setToken1"; value: IToken }
	| { type: "setPairContractAddress"; value: string }
	| { type: "setPercentage"; value: number }
	| { type: "setIsTxnPending"; value: boolean };

type Dispatch = {
	setToken0(token: IToken): void;
	setToken1(token: IToken): void;
	setIsTxnPending(isPending: boolean): void;
	setPercentage(percentage: number): void;
	setPairContractAddress(pairContractAddress: string): void;
};

type State = {
	token0: IToken | undefined;
	token1: IToken | undefined;
	pairContractAddress: string;
	percentage: number;
	isTxnPending: boolean;
};

type RemoveProviderProps = { children: React.ReactNode };

const RemoveContext = createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

function removeReducer(_state: State, action: Action) {
	switch (action.type) {
		case "setToken0": {
			return { ..._state, token0: action.value };
		}
		case "setToken1": {
			return { ..._state, token1: action.value };
		}
		case "setPairContractAddress": {
			return { ..._state, pairContractAddress: action.value };
		}
		case "setPercentage": {
			return { ..._state, percentage: action.value };
		}
		case "setIsTxnPending": {
			return { ..._state, isTxnPending: action.value };
		}
		// default: {
		// 	throw new Error(`Unhandled action type: ${action.type}`);
		// }
	}
}

const RemoveProvider: FC<RemoveProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(removeReducer, {
		token0: undefined,
		token1: undefined,
		pairContractAddress: "",
		percentage: 0,
		isTxnPending: false,
	});

	const dispatchWithAction = useMemo(
		() => ({
			setToken0: (value: IToken) => dispatch({ type: "setToken0", value }),
			setToken1: (value: IToken) => dispatch({ type: "setToken1", value }),
			setPairContractAddress: (value: string) => dispatch({ type: "setPairContractAddress", value }),
			setPercentage: (value: number) => dispatch({ type: "setPercentage", value }),
			setIsTxnPending: (value: boolean) => dispatch({ type: "setIsTxnPending", value }),
		}),
		[dispatch]
	);

	return (
		<RemoveContext.Provider
			value={useMemo(() => {
				return { state, dispatch: dispatchWithAction };
			}, [state])}>
			{children}
		</RemoveContext.Provider>
	);
};

const useRemoveContext = () => {
	const context = useContext(RemoveContext);
	if (!context) {
		throw new Error("Hook can only be used inside Pool Provider");
	}

	return context;
};

const useRemoveLiqState = () => {
	const context = useRemoveContext();
	return context.state;
};

const useRemoveLiqDispatch = () => {
	const context = useRemoveContext();
	return context.dispatch;
};

export { RemoveProvider, useRemoveLiqState, useRemoveLiqDispatch };
