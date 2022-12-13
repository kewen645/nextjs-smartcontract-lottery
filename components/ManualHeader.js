import { useMoralis } from 'react-moralis'
import { useEffect } from 'react'

const ManualHeader = () => {
	const { enableWeb3, account, isWeb3Enabled, isWeb3EnableLoading, Moralis, deactivateWeb3 } = useMoralis()

	useEffect(() => {
		if (isWeb3Enabled) return
		if (localStorage.getItem('connected')) enableWeb3()
	}, [])

	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			if (!account) {
				localStorage.removeItem('connected')
				deactivateWeb3()
			}
		})
	}, [])

	const handleClick = async () => {
		await enableWeb3()
		localStorage.setItem('connected', 'injected')
	}

	return (
		<div>
			{account ? (
				<div>
					Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
				</div>
			) : (
				<button onClick={handleClick} disabled={isWeb3EnableLoading}>
					Connect
				</button>
			)}
		</div>
	)
}

export default ManualHeader
