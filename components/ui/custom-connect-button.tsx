import { ConnectButton } from "@rainbow-me/rainbowkit";

export const CustomConnectButton = () => {
  return (
    <div className="min-w-[140px] flex-shrink-0">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="bg-gradient-to-tr from-[#254192] to-[#192E69] text-white hover:shadow-xl cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="bg-gradient-to-tr from-red-500 to-red-600 text-white hover:shadow-xl cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <div className="flex gap-3">
                    {/*<button*/}
                    {/*  onClick={openChainModal}*/}
                    {/*  className="bg-gradient-to-tr from-[#254192] to-[#192E69] text-white hover:shadow-xl cursor-pointer px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"*/}
                    {/*  type="button"*/}
                    {/*>*/}
                    {/*  {chain.hasIcon && (*/}
                    {/*    <div*/}
                    {/*      className="w-3 h-3 rounded-full overflow-hidden mr-2"*/}
                    {/*      style={{ backgroundColor: chain.iconBackground }}*/}
                    {/*    >*/}
                    {/*      {chain.iconUrl && (*/}
                    {/*        <img*/}
                    {/*          alt={chain.name ?? "Chain icon"}*/}
                    {/*          src={chain.iconUrl}*/}
                    {/*          className="w-3 h-3"*/}
                    {/*        />*/}
                    {/*      )}*/}
                    {/*    </div>*/}
                    {/*  )}*/}
                    {/*  {chain.name}*/}
                    {/*</button>*/}

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-gradient-to-tr from-[#254192] to-[#192E69] text-white hover:shadow-xl cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-200"
                    >
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
