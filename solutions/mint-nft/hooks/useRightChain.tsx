import { useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'
import { NETWORK_ID } from '../helpers/constant.helpers'

export const useRightChain = () => {
  const [isRightChain, setIsRightChain] = useState(true)
  const [{ data }, switchNetwork] = useNetwork()

  const handleSwitchNetwork = () => {
    if (
      typeof data.chain !== 'undefined' &&
      typeof switchNetwork !== 'undefined'
    ) {
      switchNetwork(NETWORK_ID)
    }
  }

  useEffect(() => {
    if (data.chain) {
      setIsRightChain(data?.chain?.id === NETWORK_ID)
    }
  }, [data.chain])

  return { isRightChain, handleSwitchNetwork }
}
