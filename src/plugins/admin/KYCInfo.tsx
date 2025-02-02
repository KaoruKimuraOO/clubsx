import React, { useEffect, useState } from 'react'

import NotVerifiedBannerImg from './assets/NotVerifiedBannerImg.svg'
import IdentityVerificationBg from './assets/Identity-Verification.mp4'

enum KYCStatuses {
  VERIFIED,
  NOT_VERIFIED,
}

const FundsInfo = (props: {
  propertyAddress: string
  chainId: number
  uniqueBeneficiaries: string[]
}) => {
  const [connection, setConnection] = useState<any>(undefined)
  const [currentAddress, setCurrentAddress] = useState<string>()
  const [KYCStatus, setKYCStatus] = useState<KYCStatuses>(
    KYCStatuses.NOT_VERIFIED,
  )

  useEffect(() => {
    const checkConnection = async () => {
      const _connection = await import('@devprotocol/clubs-core/connection')
      setConnection(_connection)
    }

    checkConnection()
  }, [props])

  useEffect(() => {
    if (!connection) {
      return
    }

    setCurrentAddress(connection.connection().account.getValue())
    connection.connection().account.subscribe((a: string) => {
      setCurrentAddress(a)
    })
  }, [connection])

  return (
    <>
      {/* <!------ Loggin/Connection status --------------> */}
      {!currentAddress && (
        <div className="mb-16 flex w-fit max-w-full items-center justify-center gap-5 rounded-md bg-dp-yellow-400 px-8 py-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.9825 16.725C15.2838 15.7999 14.3798 15.0496 13.3417 14.5334C12.3036 14.0171 11.1599 13.7489 10.0005 13.75C8.84115 13.7489 7.69739 14.0171 6.65932 14.5334C5.62125 15.0496 4.71724 15.7999 4.0185 16.725M15.9825 16.725C17.346 15.5122 18.3076 13.9136 18.7417 12.1411C19.1758 10.3686 19.0608 8.50609 18.412 6.80048C17.7632 5.09487 16.6112 3.62678 15.1089 2.5909C13.6066 1.55502 11.8248 1.00029 10 1.00029C8.17516 1.00029 6.39343 1.55502 4.89111 2.5909C3.38878 3.62678 2.23683 5.09487 1.58804 6.80048C0.939242 8.50609 0.824253 10.3686 1.25832 12.1411C1.69239 13.9136 2.655 15.5122 4.0185 16.725M15.9825 16.725C14.3365 18.1932 12.2061 19.0031 10.0005 19C7.79453 19.0034 5.66474 18.1934 4.0185 16.725M13.0005 7.75C13.0005 8.54565 12.6844 9.30871 12.1218 9.87132C11.5592 10.4339 10.7962 10.75 10.0005 10.75C9.20485 10.75 8.44179 10.4339 7.87918 9.87132C7.31657 9.30871 7.0005 8.54565 7.0005 7.75C7.0005 6.95435 7.31657 6.19129 7.87918 5.62868C8.44179 5.06607 9.20485 4.75 10.0005 4.75C10.7962 4.75 11.5592 5.06607 12.1218 5.62868C12.6844 6.19129 13.0005 6.95435 13.0005 7.75Z"
              stroke={currentAddress ? 'white' : 'black'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-black">Not connected to a wallet</p>
        </div>
      )}

      {KYCStatus === KYCStatuses.VERIFIED && (
        <div className="w-full grid lg:grid-cols-2 gap-5 py-5 px-8 rounded-2xl bg-dp-blue-grey-300 dark:bg-dp-blue-grey-200 justify-center items-center">
          <p className="font-bold text-xl text-center">Identity Verification</p>
          <div className="flex justify-center items-center">
            <p className="w-fit rounded-lg p-1.5 bg-dp-green-400 text-center">
              Verified
            </p>
          </div>
        </div>
      )}

      {KYCStatus !== KYCStatuses.VERIFIED && (
        <div className="relative w-full max-w-full min-h-[292px] rounded-2xl p-8">
          <video
            autoPlay={true}
            loop
            muted
            className="absolute inset-0 w-full h-full max-w-full max-h-full object-cover rounded-2xl"
          >
            <source src={IdentityVerificationBg} type="video/mp4" />
          </video>
          <div className="relative w-full h-full grid lg:grid-cols-2 gap-5 justify-center items-center z-1 rounded-2xl">
            <p className="font-bold text-2xl text-center text-dp-white-ink">
              Identity Verification
            </p>
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="w-fit rounded-lg bg-native-blue-400 p-5">
                <img src={NotVerifiedBannerImg.src} alt="Not verified" />
              </div>
              <p className="w-fit font-body text-base font-bold text-dp-white-ink">
                Not verified
              </p>
              <button className="hs-button is-filled py-6 px-8 bg-dp-blue-grey-600 text-dp-blue-grey-ink">
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FundsInfo
