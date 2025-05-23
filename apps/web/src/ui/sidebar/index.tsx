'use client'

import {
  Badge,
  Button,
  type ButtonProps,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  classNames,
} from '@sushiswap/ui'
import { NetworkIcon } from '@sushiswap/ui/icons/NetworkIcon'
import { usePathname, useRouter } from 'next/navigation'
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import {
  NEW_CHAIN_IDS,
  type NonStandardChainId,
  SUPPORTED_NETWORKS,
} from 'src/config'
import { getNetworkName, replaceNetworkSlug } from 'src/lib/network'
import { type ChainId, isChainId } from 'sushi/chain'

interface SidebarContextType {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>> | null
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: null,
})

export const useSidebar = () => {
  return useContext(SidebarContext)
}

interface SidebarProviderProps {
  children: ReactNode
  defaultOpen?: boolean
}

export const SidebarProvider: FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const SidebarToggle: FC<Omit<ButtonProps, 'onClick'>> = (props) => {
  const { isOpen, setIsOpen } = useSidebar()

  return <Button onClick={() => setIsOpen?.(!isOpen)} {...props} />
}

export interface SidebarContainerProps {
  children: ReactNode
  shiftContent?: boolean
  selectedNetwork?: number | string
  connectedNetwork?: number | string
  supportedNetworks?: readonly (ChainId | NonStandardChainId)[]
  unsupportedNetworkHref?: string
  onSelect?: ((network: ChainId | NonStandardChainId) => void) | null
}

export const SidebarContainer: FC<SidebarContainerProps> = ({
  children,
  shiftContent = false,
  selectedNetwork,
  connectedNetwork,
  supportedNetworks,
  unsupportedNetworkHref,
  onSelect,
}) => {
  const { isOpen } = useSidebar()

  return (
    <div className="flex h-full min-h-0">
      <Sidebar
        selectedNetwork={selectedNetwork}
        connectedNetwork={connectedNetwork}
        supportedNetworks={supportedNetworks}
        onSelect={onSelect}
        unsupportedNetworkHref={unsupportedNetworkHref}
      />
      <div
        className={classNames(
          'flex-1 h-full overflow-y-auto',
          !shiftContent && isOpen ? 'lg:-ml-56' : null,
        )}
      >
        {children}
      </div>
    </div>
  )
}

const Sidebar: FC<Omit<SidebarContainerProps, 'children' | 'shiftContent'>> = ({
  selectedNetwork: _selectedNetwork,
  connectedNetwork,
  supportedNetworks = SUPPORTED_NETWORKS,
  unsupportedNetworkHref,
  onSelect: _onSelect,
}) => {
  const { isOpen } = useSidebar()

  const { push } = useRouter()
  const pathname = usePathname()

  const isSupportedNetwork = useCallback(
    (network: ChainId | NonStandardChainId) =>
      supportedNetworks.includes(network),
    [supportedNetworks],
  )

  const onSelect = useCallback(
    (value: string) => {
      const _network = value.split('__')[1]

      const network = isChainId(+_network)
        ? (+_network as ChainId)
        : (_network as NonStandardChainId)

      if (_onSelect === null) return
      if (typeof _onSelect === 'function') return _onSelect(network)

      push(replaceNetworkSlug(network, pathname), { scroll: false })
    },
    [pathname, push, _onSelect],
  )

  const selectedNetwork = _selectedNetwork ?? connectedNetwork

  return !isOpen ? null : (
    <nav className="hidden lg:block z-10 bg-gray-100 dark:bg-slate-900 w-56 h-full border-r border-gray-200 dark:border-slate-800">
      <div className="h-full flex flex-col pt-3">
        <Command>
          <div className="px-1">
            <span className="text-muted-foreground text-xs px-3">
              Browse Network
            </span>
            <CommandInput
              testdata-id="network-selector-input"
              placeholder="Search..."
            />
          </div>
          <CommandGroup className="overflow-y-auto">
            {SUPPORTED_NETWORKS.map((network) => {
              const name = getNetworkName(network)
              const isSupported = isSupportedNetwork(network)

              return (
                <CommandItem
                  key={network}
                  className={`[aria-selected="true"]:!bg-[unset] [aria-selected="true"]:!text-[unset] !p-0 my-0.5`}
                  testdata-id={`network-selector-${network}`}
                  value={`${name}__${network}`}
                  onSelect={
                    isSupported
                      ? onSelect
                      : unsupportedNetworkHref
                        ? () => push(unsupportedNetworkHref)
                        : undefined
                  }
                >
                  <Button
                    className="flex items-center !justify-normal gap-2"
                    fullWidth
                    variant={
                      selectedNetwork === network ? 'secondary' : 'ghost'
                    }
                    disabled={!isSupported}
                  >
                    <Badge
                      position="bottom-right"
                      badgeContent={
                        <div
                          className={classNames(
                            'rounded-full w-2 h-2 mr-0.5 mb-0.5',
                            connectedNetwork === network && 'bg-green',
                          )}
                        />
                      }
                    >
                      <NetworkIcon chainId={network} width={22} height={22} />
                    </Badge>
                    {name}
                    {NEW_CHAIN_IDS.includes(
                      network as (typeof NEW_CHAIN_IDS)[number],
                    ) ? (
                      <div className="text-[10px] italic rounded-full px-[6px] bg-gradient-to-r from-blue to-pink text-white font-bold">
                        NEW
                      </div>
                    ) : null}
                  </Button>
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandEmpty>No network found.</CommandEmpty>
        </Command>
      </div>
    </nav>
  )
}
