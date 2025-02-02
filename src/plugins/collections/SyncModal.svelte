<script lang="ts">
  import type { Collection } from '@plugins/collections'
  import {
    address,
    callSlotCollections,
  } from '@plugins/collections/utils/slotCollections'
  import {
    type ContractRunner,
    type Signer,
    type TransactionResponse,
    ZeroAddress,
    parseUnits,
  } from 'ethers'
  import { tokenInfo } from '@constants/common'
  import BigNumber from 'bignumber.js'
  import { bytes32Hex } from '@devprotocol/clubs-core'
  import type { ExpectedStatus } from '@components/Collections/types'
  import SyncStatus from '@components/Collections/SyncStatus.svelte'

  export let collections: Collection[] = []
  export let propertyAddress: string
  export let chainId: number
  export let rpcUrl: string

  const customTimeDescriptorAddress = address.find(
    ({ chainId: chainId_ }) => chainId_ === chainId,
  )?.addressList.timeSlot
  const customMemberDescriptorAddress = address.find(
    ({ chainId: chainId_ }) => chainId_ === chainId,
  )?.addressList.memberSlot

  const expectedMemberships: ExpectedStatus[] = collections.flatMap(
    (collection) =>
      collection.memberships.map((mem) => {
        const { decimals, address: token } = tokenInfo[mem.currency][chainId]
        return collection.isTimeLimitedCollection
          ? {
              payload: bytes32Hex(mem.payload),
              source: mem,
              isTimeLimitedCollection: true,
              state: {
                src: mem.imageSrc,
                name: JSON.stringify(mem.name).slice(1, -1),
                description: JSON.stringify(mem.description).slice(1, -1),
                deadline: collection.endTime ? BigInt(collection.endTime) : 0n,
                requiredTokenAmount: parseUnits(String(mem.price), decimals),
                requiredTokenFee: mem.fee?.percentage
                  ? parseUnits(
                      new BigNumber(mem.price)
                        .times(mem.fee.percentage)
                        .dp(decimals, 1)
                        .toFixed(),
                      decimals,
                    )
                  : 0n,
                token: token,
                gateway: mem.fee?.beneficiary ?? ZeroAddress,
              },
            }
          : {
              payload: bytes32Hex(mem.payload),
              source: mem,
              isTimeLimitedCollection: false,
              state: {
                src: mem.imageSrc,
                name: JSON.stringify(mem.name).slice(1, -1),
                description: JSON.stringify(mem.description).slice(1, -1),
                slots: mem.memberCount ? BigInt(mem.memberCount) : 0n,
                requiredTokenAmount: parseUnits(String(mem.price), decimals),
                requiredTokenFee: mem.fee?.percentage
                  ? parseUnits(
                      new BigNumber(mem.price)
                        .times(mem.fee.percentage)
                        .dp(decimals, 1)
                        .toFixed(),
                      decimals,
                    )
                  : 0n,
                token: token,
                gateway: mem.fee?.beneficiary ?? ZeroAddress,
              },
            }
      }),
  )
  const stateFetcher = async ({
    provider,
    propertyAddress,
    payload,
    isTimeLimitedCollection,
  }: {
    provider: ContractRunner
    propertyAddress: string
    payload: string
    isTimeLimitedCollection: boolean
  }) => {
    return callSlotCollections(
      provider,
      'propertyImages',
      isTimeLimitedCollection,
      [propertyAddress, payload],
    )
  }
  const stateSetter = async ({
    provider,
    propertyAddress,
    states,
  }: {
    provider: Signer
    propertyAddress: string
    states: ExpectedStatus[]
  }) => {
    const timeStates = states.filter(
      ({ isTimeLimitedCollection }) => isTimeLimitedCollection,
    )
    const memberStates = states.filter(
      ({ isTimeLimitedCollection }) => !isTimeLimitedCollection,
    )

    // Filter out states with empty payload
    const validTimeStates = timeStates.filter(
      ({ payload }) => payload.trim() !== '',
    )
    const validMemberStates = memberStates.filter(
      ({ payload }) => payload.trim() !== '',
    )

    const results: TransactionResponse[] = []
    if (validTimeStates.length) {
      const res = await callSlotCollections(provider, 'setImages', true, [
        propertyAddress,
        validTimeStates.map(({ state }) => state),
        validTimeStates.map(({ payload }) => payload),
      ])
      results.push(res)
    }

    if (validMemberStates.length) {
      const res = await callSlotCollections(provider, 'setImages', false, [
        propertyAddress,
        validMemberStates.map(({ state }) => state),
        validMemberStates.map(({ payload }) => payload),
      ])
      results.push(res)
    }
    return results
  }
</script>

<SyncStatus
  {customTimeDescriptorAddress}
  {customMemberDescriptorAddress}
  expected={expectedMemberships}
  {stateFetcher}
  {stateSetter}
  {propertyAddress}
  {rpcUrl}
/>
