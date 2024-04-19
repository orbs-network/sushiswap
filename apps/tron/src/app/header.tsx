'use client'

import { SushiIcon } from '@sushiswap/ui/components/icons'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@sushiswap/ui/components/navigation-menu'
import React, { FC } from 'react'

export const Navigation: FC = () => {
  return (
    <div className="px-4 sticky flex items-center flex-grow gap-4 top-0 z-50 min-h-[56px] max-h-[56px] h-[56px] bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
      <SushiIcon width={24} height={24} />
      <div className="flex items-center justify-between flex-grow gap-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="hidden lg:block">
              <NavigationMenuLink
                href="/swap"
                className={navigationMenuTriggerStyle()}
              >
                Swap
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className="hidden lg:block">
              <NavigationMenuLink
                href="/pool"
                className={navigationMenuTriggerStyle()}
              >
                Pool
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem className="hidden lg:block">
              <NavigationMenuLink
                href="/explore"
                className={navigationMenuTriggerStyle()}
              >
                Explore
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">Wallet Connector</div>
      </div>
    </div>
  )
}

export const Header: FC = () => {
  return <Navigation />
}
