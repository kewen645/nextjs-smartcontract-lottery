import { useState, useEffect } from 'react'
import { useWeb3Contract, useMoralis } from 'react-moralis'
import { useNotification } from '@web3uikit/core'
import { ethers } from 'ethers'
import { abi, contractAddresses } from '../constants'

const LotteryEntrance = () => {
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
	const chainId = parseInt(chainIdHex)
	// 虽然chainId在contractAddresses中是string字符串，但是对象中不需要硬性要求转换格式
	const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

	const [entranceFee, setEntranceFee] = useState('0')
	const [numPlayers, setNumPlayers] = useState('0')
	const [recentWinner, setRecentWinner] = useState('0')

	// web3uikit notification
	const dispatch = useNotification()

	/* View Functions */
	const { runContractFunction: getEntranceFee } = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: 'getEntranceFee',
		params: {},
	})

	const { runContractFunction: getNumPlayers } = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: 'getNumPlayers',
		params: {},
	})

	const { runContractFunction: getRecentWinner } = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: 'getRecentWinner',
		params: {},
	})

	useEffect(() => {
		if (isWeb3Enabled) updateUIValues()
	}, [isWeb3Enabled])

	const updateUIValues = async () => {
		// Another way we could make a contract call:
		// const options = { abi, contractAddress: raffleAddress }
		// const fee = await Moralis.executeFunction({
		//     functionName: "getEntranceFee",
		//     ...options,
		// })

		const entranceFeeFromCall = (await getEntranceFee()).toString()
		const numPlayersFromCall = (await getNumPlayers()).toString()
		const recentWinnerFromCall = (await getRecentWinner()).toString()
		setEntranceFee(entranceFeeFromCall)
		setNumPlayers(numPlayersFromCall)
		setRecentWinner(recentWinnerFromCall)
	}

	const {
		// data,
		// error,
		runContractFunction: enterRaffle,
		isFetching,
		isLoading,
	} = useWeb3Contract({
		abi,
		contractAddress: raffleAddress,
		functionName: 'enterRaffle',
		params: {},
		// 这里得msgValue要的是非格式化的ethers
		msgValue: entranceFee,
	})

	const handleNewNotification = async () => {
		dispatch({
			type: 'info',
			message: 'Transaction Completed!',
			title: 'Transaction Notification',
			position: 'topR',
			icon: 'bell',
		})
	}

	// 调用runContractFunction，会有callback函数让你handle responses
	// 并且会把transaction作为参数传入
	const handleSuccess = async (tx) => {
		try {
			await tx.wait(1)
			await updateUIValues()
			handleNewNotification()
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div className='p-5'>
			<h1 className='py-2 font-bold text-3xl border-t-2'>Lottery</h1>
			{raffleAddress ? (
				<>
					<button
						className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto'
						onClick={async () =>
							await enterRaffle({
								// onComplete:
								// onSuccess checks to see if the tx is successfully sent to MetaMask
								onSuccess: handleSuccess,
								onError: (error) => console.log(error),
							})
						}
						disabled={isLoading || isFetching}>
						{isLoading || isFetching ? <div className='animate-spin spinner-border h-8 w-8 border-b-2 rounded-full'></div> : 'Enter Raffle'}
					</button>
					<div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH</div>
					<div>The current number of players is: {numPlayers}</div>
					<div>The most previous winner was: {recentWinner}</div>
				</>
			) : (
				<div>Please connect to a supported chain</div>
			)}
		</div>
	)
}

export default LotteryEntrance
